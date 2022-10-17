import React, {useState, useEffect} from 'react';
import './App.css';

import ChatListItem from './components/ChatListItem';
import ChatIntro from './components/ChatIntro';
import ChatWindow from './components/ChatWindow';
import NewChat from './components/newChat';
import Login from './components/Login';

import Api from './Api';

import DonutLarge from '@material-ui/icons/DonutLarge';
import Chat from '@material-ui/icons/Chat';
import MoreVert from '@material-ui/icons/MoreVert';
import Search from '@material-ui/icons/Search';

export default () => {

  const [chatlist, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState({});
  const [user, setUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(()=> {
    if(user !== null) {
      let unsub = Api.onChatList(user.id, setChatList);
      return unsub;
    }
  }, [user])

  const handleNewChat = () => {
    setShowNewChat(true);
  }

  const handleLoginData = async (u) => {
    let newUser = {
      id: u.uid,
      name: u.displayName,
      avatar: u.photoURL
    };
    await Api.addUser(newUser);
    setUser(newUser);
  }

  if(user === null) {
    return (<Login onReceive={handleLoginData} />);
  }

  return (
    <div className="app-window">
        <div className="sidebar">
          <NewChat
            chatlist={chatlist}
            user={user} 
            show={showNewChat}
            setShow={setShowNewChat}
          />
          <header>
            <img className="header--avatar" src={user.avatar} alt=""/>
            <div className="header--buttons">
              <div className="header--btn">
                <DonutLarge style={{color: '#919191'}} />
              </div>
              <div onClick={handleNewChat} className="header--btn">
                <Chat style={{color: '#919191'}} />
              </div>
              <div className="header--btn">
                <MoreVert style={{color: '#919191'}} />
              </div>
            </div>
          </header>

          <div className="search">
            <div className="search-input">
              <Search fontSize= "small" style={{color: '#919191'}} />
              <input type="search" placeholder="Procurar ou começar uma nova conversa" />
            </div>
          </div>

          <div className="chatlist">
            {chatlist.map((item, key)=>(
              <ChatListItem
                key={key}
                data={item}
                active={activeChat.chatId === chatlist[key].chatId}
                onClick={()=>setActiveChat(chatlist[key])}
              />
            ))}
          </div>
          
        </div>
        <div className="contentarea">

             {activeChat.chatId !== undefined &&
                <ChatWindow
                  user={user}
                  data={activeChat}
                />
             }
             {activeChat.chatId === undefined &&
                <ChatIntro/>
             }
             
        </div>
    </div>
  )
}