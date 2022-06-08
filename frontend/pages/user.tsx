import React, { useState } from 'react';
import type { NextPage } from 'next'
import axios from 'axios';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentUserIDState, currentUserQuery } from '../contexts/user';
import { Server } from 'http';
import { create } from 'domain';

interface QaData {
  QA_id: string;
  title: string;
  contents: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    phone_num: string;
  }
  id: number;
}

const User: NextPage = () => {
  const [title, setTitle] = React.useState("")
  const [contents, setContents] = React.useState("")
  const [mode, setMode] = React.useState("Create")
  const [QaDatas, setQaDatas] = React.useState<Array<QaData>>([]) 
  const [targetID, setTargetID] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure()
  const userinfo = useRecoilValue(currentUserQuery)
  const tmpQaDatas : any[] = [];

  const handleTitle: React.ChangeEventHandler<HTMLInputElement> = (event) => setTitle(event.target.value)
  const handleContents: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => setContents(event.target.value)
  
  const ServerUrl = 'http://127.0.0.1:8000/user/' + String(userinfo._id);
  const CreateUrl = 'http://127.0.0.1:8000/user/create';
  const UpdateUrl = 'http://127.0.0.1:8000/user/'
  
  React.useEffect(() => {
    PullData()
  }, [])

  // Originally Pulling data from DB
  // And then, saved data called "QaDatas"
  const PullData = () => {
    axios.get(ServerUrl,{
      headers: {
        "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
      }
    }).then((res) => {
        for(let i=0; i<res.data.length; i++){
          tmpQaDatas.push(res.data[i]);
        }
        setQaDatas(tmpQaDatas);
      }
    )
  } 

  // Create Item
  const addTopics = () => {
    const data = {
      title,
      contents,
      user: {
        name : userinfo.name,
        phone_num : userinfo.phone_num
      }
    }

    axios.post(CreateUrl, data, {
      headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
      }
    }).then((res) => {
        setTitle("");
        setContents("");
        PullData();//Ready to Read Item
    })
    onClose();
  }

  // Update Item
  const updateTopics = (target_id: String) => {
    const newTopics = [...QaDatas]
    setQaDatas(newTopics);
    
    const data = {
      QA_id: target_id,
      title,
      contents,
    }
    
    let updateurl = UpdateUrl + String(target_id);
    axios.put(updateurl, data, {
      headers: {
        "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
      }
    }).then((res) => {
      console.log(res);
      PullData();//Ready to Read Item
    })
    onClose();
    
    // Setting empty variable & Ready to Create mode
    setTitle("");
    setContents("");
    setMode("Create");
  }
  
  // Delete Item
  const deletetopics = (target_id:string) => {
    let url = UpdateUrl + String(target_id);
    axios.delete(url, {
      headers:{
        "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
      }
    }).then((res) => {
      console.log(res);
      PullData();//Ready to Read Item
    })
  }

  // Targeting Data and ready to open modal
  const reOpen = (topic: QaData) =>{
    setTargetID(topic.QA_id);
    setTitle(topic.title);
    setContents(topic.contents);
  }
  
  // Process Mode change parts
  let content = null;
  if(mode === "Create"){
    content = <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>상담 생성</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Input value={title} onChange={handleTitle}/>
        <Textarea value={contents} onChange={handleContents}/>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={addTopics}>
          추가
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  }else if(mode === "Update"){
    content = <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>상담 수정</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Input value={title} onChange={handleTitle}/>
        <Textarea value={contents} onChange={handleContents}/>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={()=>{updateTopics(targetID)}}>
          수정
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  }

  // rendering elements
  return (
    <div>
      <Accordion>
        <AccordionItem>
          <AccordionButton onClick={onOpen}>
            📑
          </AccordionButton>
        </AccordionItem>
        {QaDatas.map((QaData) => (
          <AccordionItem key={QaData.QA_id}>
            <AccordionButton>
              {QaData.title}
            </AccordionButton>
            <AccordionPanel>
              {QaData.contents}
              <Button colorScheme='purple' mr={3} onClick={(event)=>{
                event.preventDefault();
                onOpen();
                reOpen(QaData);
                setMode("Update");
              }}>수정</Button>

              <Button colorScheme='blue' mr={3} onClick={(event)=>{
                event.preventDefault();
                deletetopics(QaData.QA_id);
              }}>삭제</Button>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      {content}
    </div>
  )
}

export default User;