import React, {useState, useEffect, useRef} from 'react';
import EmojiPicker from 'emoji-picker-react';
import './ChatWindow.css';

import MessageItem from './MessageItem';

import Api from '../Api';

import Search from '@material-ui/icons/Search';
import AttachFile from '@material-ui/icons/AttachFile';
import MoreVert from '@material-ui/icons/MoreVert';
import InsertEmoticon from '@material-ui/icons/InsertEmoticon';
import Close from '@material-ui/icons/Close';
import Send from '@material-ui/icons/Send';
import Mic from '@material-ui/icons/Mic';

export default ({user, data}) => {

    /*   
        UseRef: primeiro ele criou um espaço onde ele vai guardar o elemento que rendeniza a lista na tela, usando o useRef, ai ele atribui esse elemento para essa ref por meio da prop ref. E por último ele tem um useEffect que será executado toda vez que a lista for modificada, e nisso veridicar se o conteúdo dele é maior do que a altura que ele mostra na tela (ou seja tem barra de rolagem), ai se ele tiver a barra de rolagem, ele vai mexer o scroll (e por isso ele está atribuindo um valor para scrollTop) para uma posição, e como ele quer que seja o final da lista, ele faz o calculo quanto tem que mexer subtraindo um do outro.
    */
    const body = useRef(); 

    let recognition = null;
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecognition !=- undefined) {
        recognition = new SpeechRecognition();
    }

    const [emojiOpen, setEmojiOpen] = useState(false);
    const [text, setText] = useState('');
    const [listening, setListening] = useState(false);
    const [list, setList] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(()=> {
        setList([]);
        let unsub = Api.onChatContent(data.chatId, setList, setUsers);
        return unsub;
        }, [data.chatId]);

    useEffect(()=> {
        if(body.current.scrollHeight > body.current.offsetHeight) {
            body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
        }
    }, [list]);

    
    const handleEmojiClick = (e, emojiObject) => {
        setText( text + emojiObject.emoji );
    }

    const handleOpenEmoji = () => {
        setEmojiOpen(true);
    }

    const handleCloseEmoji = () => {
        setEmojiOpen(false);
    }

    const handleMicClick = () => {
        if(recognition !== null) {

            recognition.onstart = () => {
                setListening(true);
            }
            recognition.onend = () => {
                setListening(false);
            }
            recognition.onresult = (e) => {
                setText(e.results[0][0].transcript);
            }

            recognition.start();
        }
    }

    const handleInputKeyUp = (e) => {
        if(e.keyCode == 13) {
            handleSendClick();
        }
    }

    const handleSendClick = () => {
        if(text !== '') {
            Api.sendMessage(data, user.id, 'text', text, users);
            setText('');
            setEmojiOpen(false);
        }
    }

    return (
        <div className="chatWindow">
            <div className="chatWindow--header">

                <div className="chatWindow--headerinfo">
                    <img className="chatWindow--avatar" src={data.image} alt="" />
                    <div className="chatWindow--name">{data.title}</div>
                </div>

                <div className="chatWindow--headerbuttons">

                    <div className="chatWindow--btn">
                        <Search style={{color: '#919191'}} />
                    </div>

                    <div className="chatWindow--btn">
                        <AttachFile style={{color: '#919191'}} />
                    </div>

                    <div className="chatWindow--btn">
                        <MoreVert style={{color: '#919191'}} />
                    </div>

                </div>

            </div>
            <div ref={body} className="chatWindow--body">
                {list.map((item, key)=>(
                    <MessageItem
                        key={key}
                        data={item}
                        user={user}
                    />
                ))}
            </div>

            <div className="chatWindow--emojiarea" style={{height: emojiOpen ? '200px' : '0px'}}>
                <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                disableSearchBar
                disableSkinTonePicker
                />
            </div>
            

            <div className="chatWindow--footer">

                <div className="chatWindow--pre">

                    <div className="chatWindow--btn" onClick={handleCloseEmoji} style={{width: emojiOpen?40:0}}>
                        <Close style={{color: '#919191'}} />
                    </div>

                    <div className="chatWindow--btn" onClick={handleOpenEmoji}>
                        <InsertEmoticon style={{color: emojiOpen? '#009688' : '#919191'}} />
                    </div>

                </div>

                <div className="chatWindow--inputarea">
                    <input className="chatWindow--input" type="text" placeholder="Digite uma mensagem" value={text} onChange={e=>setText(e.target.value)} onKeyUp={handleInputKeyUp} />
                </div>

                 <div className="chatWindow--pos">

                    {text === '' &&
                        <div onClick={handleMicClick} className="chatWindow--btn">
                            <Mic style={{color: listening ? '#126ece' : '#919191'}} />
                        </div>
                    } 

                    {text !== '' &&
                        <div onClick={handleSendClick} className="chatWindow--btn">
                            <Send style={{color: '#919191'}} />
                        </div>
                    }

                </div>

            </div>
        </div>
    )
}