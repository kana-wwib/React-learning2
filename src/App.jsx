import React, {useState, useCallback, useEffect} from 'react';	
import './assets/styles/style.css'	
import defaultDataset from "./dataset";
import {db} from './firebase/index'	
import './assets/styles/style.css';
import {AnswersList, Chats, Loading} from './components/index'	
import {FormDialog} from "./components/Forms/index";


const App = () => {
  const [answers, setAnswers] = useState ([]);
  const [chats, setChats] = useState ([]);
  const [currentId, setCurrentId] = useState ("init");
  const [dataset, setDataset] = useState ({});
  const [open, setOpen] = useState (false);

  const addChats = (chat) => {
    setChats(prevChats => {
      return [...prevChats, chat]
    })
  }

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);


  const displayNextQuestion = (nextQuestionId, nextDataset) => {
    addChats ({
      text: nextDataset.question,
      type: 'question'
    });
    
      setAnswers(nextDataset.answers)
      setCurrentId(nextQuestionId)
  }

  const selectAnswer = useCallback((selectedAnswer, nextQuestionId) => {
    switch(true) {
      case (nextQuestionId === 'contact'):
        handleClickOpen();
        break;

      case (/^https:*/.test(nextQuestionId)):
        const a = document.createElement('a');
        a.href= nextQuestionId;
        a.target = '_blank'; //別タブで開く
        a.click();
        break;

      default:
        addChats({
          text: selectedAnswer,
          type: 'answer'
        })

      setTimeout(() => displayNextQuestion(nextQuestionId, dataset[nextQuestionId]), 1000)
        break;
    }
  },[answers]);




  useEffect(() => {
    (async() => {
      const initDataset = {};

      await db.collection('question').get().then(snapshots => {
        snapshots.forEach(doc => {
          const id = doc.id
          const data = doc.data()
          dataset[id] = data
        })
      })

      setDataset(initDataset)
      displayNextQuestion(currentId, initDataset[currentId])
    })()
  }, [])

  useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  })


    return (
      <section className='c-section'>
        <div className='c-box'>
          <Chats chats={chats} />
          <AnswersList answers={answers} select={selectAnswer} />
          <FormDialog open={open} handleClose={handleClose}/>
        </div>
      </section>
    );
}


export default App
