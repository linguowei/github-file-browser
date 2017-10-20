import * as React from 'react';
import { UserNameInfo } from '../App';
import { Icon, Badge } from 'antd';

interface Props {
  list: Array<UserNameInfo>;
  switchRepo: (userName: string) => void;
}

const BrowsingHistory = (props: Props) => {
  return (
    <div>
      <div className="title"> <Icon type="book" /> 浏览历史 
        <Badge style={{backgroundColor: '#87d068'}} count={props.list.length} />
      </div>
      <ul>
        {
          props.list.map((item, i) => {
            return <li 
              className="item" 
              key={i} 
              onClick={() => props.switchRepo(item.name)}
              >
              {
                i === 0 ? <span className="icon" /> : <span style={{backgroundColor: '#e9eaec'}} className="icon" />
              }
              <img width="25" height="25" src={item.avatar}/>
              <span>{item.name}</span>
            </li>;
          })
        }
      </ul>
    </div>
  );
};

export default BrowsingHistory;