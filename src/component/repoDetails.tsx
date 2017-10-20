import * as React from 'react';
import { RepoDetail, FileContent } from '../interfaces/index';
import { Icon } from 'antd';
// import syntaxHighlight from '../utils/syntaxHighlight';
import marked from 'marked';

interface Props {
  list: Array<RepoDetail>;
  getRepoDetail: (pathName: string, name: string) => void;
  getFileDetail: (pathName: string, fileName: string) => void;
  fileDateil: FileContent;
}

const RepoDetails = (props: Props) => {
  let dir: Array<RepoDetail> = [];
  let file: Array<RepoDetail> = [];
  props.list.forEach((item) => {
    if (item.type === 'dir') {
      dir.push(item);
    } else {
      file.push(item);
    }
  });
  let fileContent = '';
  if (dir.length === 0 && file.length === 0) {
    fileContent = marked(window.atob(props.fileDateil.content));
  }
  let createMarkup = function() { 
    return {__html: fileContent}; 
  };
  return (
    <ul>
      { 
        // 目录
        dir.map((item, i) => {
          return <li key={i} onClick={() => props.getRepoDetail(item.path, item.name)}>
            <Icon type="folder" />
            <span className="name">{item.name}</span>
          </li>;
        })
      }
      {
        // 文件
        file.map((item, i) => {
          return <li key={i}>
            <Icon type="file" />
            <span className="name" onClick={() => props.getFileDetail(item.path, item.name)}>{item.name}</span>
            <span className="download">
              <a href={item.download_url} download="true"><Icon type="download" /></a>
            </span>
          </li>;
        })
      }
      {
        dir.length === 0 && file.length === 0 ?
        <li className="file-detail">
          <pre dangerouslySetInnerHTML={createMarkup()} />
        </li> :
        ''
      }
    </ul>
  );
};

export default RepoDetails;