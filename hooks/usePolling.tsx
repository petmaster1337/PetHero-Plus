import { useState, useEffect, useRef } from 'react';
import { getMessages, getServices, getPriceTypes } from '@/services/event.service';
import { getHeroByUser, getNearestHeroes } from '@/services/hero.service';
import backgroundService from '@/services/background.service';

export const usePolling = (user: any, token: string, pets: any) => {
  const [neighbors, setNeighbors] = useState<any>([]);
  const [messages, setMessages] = useState<{sender: any[]; receiver: any[]}>({ sender: [], receiver: [] });
  const [services, setServices] = useState<{contractor: any[]; contractee: any[]}>({ contractor: [], contractee: [] });
  const [priceTypes, setPriceTypes] = useState<any>([]);
  const [hero, setHero] = useState<any>(null);
  const [poll, setPoll] = useState<boolean>(false);
  const workingOn = useRef<any>(null);
  workingOn.current = new Map<any, any>();

  const fetchPollingData = async () => {
    if (poll || !user) return;
    setPoll(true);
    try {
      if (neighbors.length === 0) {
        if (user.lat != 0.00) {
            const neigh = await getNearestHeroes(user, 25, 50);
            setNeighbors(neigh);
        }
      }
      await manageServicesAndMessages();
      setPriceTypes(await getPriceTypes(token));
      setPoll(false);

    } catch (error) {
      setPoll(false);
      console.log('Polling error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      (async (user) => {
        if (!hero) {
          const thisHero = await getHeroByUser(user);
          setHero(thisHero);
        }  
        setTimeout(() => {
          fetchPollingData();
        }, 500);
    
      })(user);
    }

  }, [ user])

  const updateMessages = async () => {
      const messageSender = await getMessages(token, 'sender', user) || [];
      const messageReceiver = await getMessages(token, 'receiver', user) || [];
      setMessages({ sender: messageSender, receiver: messageReceiver }); 
  }

  const manageServicesAndMessages = async() => {
    if (services.contractee.length === 0 && services.contractee.length === 0) {
      await updateServices(true);
      await updateServices(false);
      checkServicesAgain()
    }
    if (messages.sender.length === 0 && messages.receiver.length === 0) {
      await updateMessages();
      checkMessagesAgain()
    }
  }

  function* checkServicesAgain() {
    yield manageServicesAndMessages();
    yield null;
    yield null;
  }
  
  function* checkMessagesAgain() {
    yield manageServicesAndMessages();
    yield null;
    yield null;
  }
  
const updateSpecificContract = (contract: any) => {
  setServices(prev => {
    if (!prev) return prev;
    const contractorIndex = prev.contractor.findIndex(c => c._id === contract._id);
    if (contractorIndex !== -1) {
      const updatedContractor = [...prev.contractor];
      updatedContractor[contractorIndex] = {
        ...updatedContractor[contractorIndex],
        ...contract,
      };
      return { ...prev, contractor: updatedContractor };
    }

    // check if it's in contractee
    const contracteeIndex = prev.contractee.findIndex(c => c._id === contract._id);
    if (contracteeIndex !== -1) {
      const updatedContractee = [...prev.contractee];
      updatedContractee[contracteeIndex] = {
        ...updatedContractee[contracteeIndex],
        ...contract,
      };
      return { ...prev, contractee: updatedContractee };
    }
    return prev;
  });
};


  const updateServices = async (future: boolean = true) => {
      const serviceContractor = await getServices(token, 'contractor', user, future) || [];
      const serviceContractee = await getServices(token, 'contractee', hero, future) || [];  
      let mapContractor = new Map();
      let mapContractee = new Map();
      for (let item of serviceContractor) {
        mapContractor.set(item.contract._id, item);
      }
      for (let item of services.contractor) {
        mapContractor.set(item.contract._id, item)
      }

      for (let item of serviceContractee) {
        mapContractee.set(item.contract._id, item);
      }
      for (let item of services.contractee) {
        mapContractee.set(item.contract._id, item)
      }
      setServices({ contractor: [...mapContractor.values()], contractee: [...mapContractee.values()] });
  }


  return { neighbors, messages, setMessages, services, setServices, priceTypes, hero, setHero, updateMessages, updateServices, updateSpecificContract, workingOn };
};
