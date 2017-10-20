import * as React from 'react';
import './App.css';
import axios from 'axios';
import Repos from './component/repos';
import RepoDetails from './component/repoDetails';
import BrowsingHistory from './component/browsingHistory';
import { RepoInfo, UserInfo, RepoDetail, FileContent } from './interfaces/index';

import { Icon, Row, Col, Input, Spin, notification, Breadcrumb  } from 'antd';
const Search = Input.Search;

export interface UserNameInfo {
  name: string;
  avatar?: string;
}

interface States {
  userName: string;
  repos: Array<RepoInfo>;
  isLoadding: boolean;
  browsingHistory: Array<UserNameInfo>;
  breadcrumbs: Array<UserNameInfo>;
  repoDetails: Array<RepoDetail>;
  fileContent: FileContent;
}

class App extends React.Component<{}, States> {
  private leftMenu: HTMLDivElement | null;
  private content: HTMLDivElement | null;

  constructor(props: {}) {
    super(props);
    this.state = {
      userName: '',
      repos: [],
      isLoadding: false,
      browsingHistory: [],
      breadcrumbs: [],
      repoDetails: [],
      fileContent: {} as FileContent
    };
  }

  componentDidMount() {
    this.calculationHeight();
    const userName = localStorage.getItem('userName');
    const browsingHistory = localStorage.getItem('browsingHistory');
    if (userName) {
      this.handleSearch(userName);
      this.setState({userName: userName});
    }
    if (browsingHistory) {
      this.setState({
        browsingHistory: JSON.parse(browsingHistory)
      });
    }
  }

  // 计算高度
  calculationHeight() {
    if (this.leftMenu !== null && this.content !== null) {
      const leftul = this.leftMenu.querySelector('ul');
      if (leftul !== null) {
        leftul.style.height = window.innerHeight - 110 + 'px';
        leftul.style.maxHeight = window.innerHeight - 110 + 'px';
        leftul.style.overflow = 'scroll';
      }
      const rightUl = this.content.querySelector('ul');
      if (rightUl !== null) {
        rightUl.style.height = window.innerHeight - 110 + 'px';
        rightUl.style.maxHeight = window.innerHeight - 110 + 'px';
        rightUl.style.overflow = 'scroll';
      }
    }
  }
  // 添加浏览历史
  addHistory(name: string) {
    axios.get(`https://api.github.com/users/${name}`).then((res) => {
      const resData: UserInfo = res.data;
      if (res.status === 200) {
        const oldList = this.state.browsingHistory;
        let index = oldList.findIndex((item) => {
          return item.name === name;
        });
        if (index !== -1) {
          oldList.splice(index, 1);
        }
        if (oldList.length >= 100) {
          oldList.pop();
          oldList.unshift({
            name: name,
            avatar: resData.avatar_url
          });
        } else {
          oldList.unshift({
            name: name,
            avatar: resData.avatar_url
          });
        }
        this.setState({
          browsingHistory: oldList
        });
        localStorage.setItem('browsingHistory', JSON.stringify(oldList));
      }
    });
  }
  // 搜索用户Repo
  handleSearch(userName: string | null) {
    if (userName === null) {
      return;
    }
    this.setState({breadcrumbs: []});
    this.setState({isLoadding: true});
    axios.get(`https://api.github.com/users/${userName}/repos`).then((res) => {
        if (res.status === 200) {
          this.setState({
            repos: res.data
          });
          this.setState({
            isLoadding: false,
            userName: userName
          });
          this.addHistory(userName);
          this.calculationHeight();
          localStorage.setItem('userName', userName);
        }
      })
      .catch((error) => {
        this.setState({isLoadding: false});
        notification.error({
          message: '发生错误',
          description: `${error}`
        });
      });
  }
  // 获取repo信息（只获取repo的根目录信息）
  getRepoInfo(repoName: string) {
    this.setState({isLoadding: true});
    const userName = localStorage.getItem('userName');
    axios.get(`https://api.github.com/repos/${userName}/${repoName}/contents/`).then((res) => {
      if (res.status === 200) {
        let breadcrumbs = this.state.breadcrumbs;
        breadcrumbs.push({name: repoName});
        this.setState({
          repoDetails: res.data,
          breadcrumbs: breadcrumbs,
          isLoadding: false
        });
        this.calculationHeight();
      }
    });
  }
  // 获取repo详情(repo下各级目录的获取都在这里处理)
  getRepoDetail(path: string, name: string) {
    this.setState({isLoadding: true});
    const repoName = this.state.breadcrumbs[0].name;
    const userName = localStorage.getItem('userName');
    axios.get(`https://api.github.com/repos/${userName}/${repoName}/contents/${path}`)
    .then((res) => {
      if (res.status === 200) {
        let breadcrumbs = this.state.breadcrumbs;
        breadcrumbs.push({name: name});
        this.setState({
          repoDetails: res.data,
          breadcrumbs: breadcrumbs,
          isLoadding: false
        });
        this.calculationHeight();
      }
    });
  }
  getRepoDetailFromBreadcrumb(index: number) {
    this.setState({isLoadding: true});
    const userName = localStorage.getItem('userName');
    const repoName = this.state.breadcrumbs[0].name;
    let path = '';
    let url = '';
    this.state.breadcrumbs.slice(1, index + 1).forEach((item, i) => {
      path += item.name + '/';
    });
    path === '' ?
    url = `https://api.github.com/repos/${userName}/${repoName}/contents/` :
    url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
    axios.get(url)
    .then((res) => {
      if (res.status === 200) {
        this.setState({
          repoDetails: res.data,
          breadcrumbs: this.state.breadcrumbs.slice(0, index + 1),
          isLoadding: false
        });
        this.calculationHeight();
      }
    });
  }
  // 获取文件内容
  getFileDetail(path: string, name: string) {
    this.setState({isLoadding: true});
    const repoName = this.state.breadcrumbs[0].name;
    const userName = localStorage.getItem('userName');
    axios.get(`https://api.github.com/repos/${userName}/${repoName}/contents/${path}`)
    .then((res) => {
      if (res.status === 200) {
        let breadcrumbs = this.state.breadcrumbs;
        breadcrumbs.push({name: name});
        this.setState({
          repoDetails: [],
          fileContent: res.data,
          breadcrumbs: breadcrumbs,
          isLoadding: false
        });
        this.calculationHeight();
      }
    });
  }

  // 处理输入框的change事件
  handleUsernameChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({
      userName: e.currentTarget.value
    });
  }

  render() {
    return (
      <div className="App">
        <Row className="App-header">
          <Col span={18}> 
            <Icon type="github" style={{fontSize: 20}} />
            <span className="App-header-title">GitHub 文件浏览器</span>
          </Col>
          <Col span={6}> 
            <Search
              size="large"
              placeholder="input github user name"
              style={{ width: 200 }}
              onSearch={() => this.handleSearch(this.state.userName)}
              onChange={e => this.handleUsernameChange(e)}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4} className="left-menu">
            <div ref={ref => this.leftMenu = ref}>
              <BrowsingHistory 
                list={this.state.browsingHistory} 
                switchRepo={(userName: string) => this.handleSearch(userName)}
              />
            </div>
          </Col>
          <Col span={20} className="content">
            <div ref={ref => this.content = ref}>
              <div className="breadcrumb">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <Icon type="home" />
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a 
                      href="javascript:;"
                      onClick={() => this.handleSearch(localStorage.getItem('userName'))}
                    >
                      {localStorage.getItem('userName')}
                    </a>
                  </Breadcrumb.Item>
                  {
                    this.state.breadcrumbs.map((item, i) => {
                      return <Breadcrumb.Item key={i}>
                        <a 
                          href="javascript:;" 
                          onClick={() => this.getRepoDetailFromBreadcrumb(i)}
                        >{item.name}
                        </a>
                      </Breadcrumb.Item>;
                    })
                  }
                  
                </Breadcrumb>
              </div>
              {
                this.state.isLoadding ? 
                <Spin size="large" /> :
                  this.state.breadcrumbs.length > 0 ? 
                  <RepoDetails 
                    list={this.state.repoDetails} 
                    getRepoDetail={(pathName: string, name: string) => this.getRepoDetail(pathName, name)} 
                    getFileDetail={(pathName: string, fileName: string) => this.getFileDetail(pathName, fileName)} 
                    fileDateil={this.state.fileContent}
                  /> :
                  <Repos 
                    repos={this.state.repos} 
                    getRepoInfo={(repoName: string) => this.getRepoInfo(repoName)}
                  />
              }
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
