import * as React from 'react';
import { RepoInfo } from '../interfaces/index';
import { Icon } from 'antd';

interface Props {
  repos: Array<RepoInfo>;
  getRepoInfo: (repoName: string) => void;
}

const Repos = (props: Props) => {
  return(
    <ul>
      {
        props.repos.map((item, i) => {
          return <li key={i}>
            <Icon type="fork" />
            <span className="name" onClick={() => props.getRepoInfo(item.name)}>{item.name}</span>
          </li>;
        })
      }
    </ul>
  );
};

export default Repos;