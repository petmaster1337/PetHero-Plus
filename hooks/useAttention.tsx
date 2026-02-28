import { useState, useEffect } from 'react';
import { getAttention, addAttention, removeAttention } from '@/services/attention.service';
import { AttentionProps } from '@/constants/interfaces';
import { useRouter } from "expo-router";

export const useAttention = (token: string, user: any) => {
  const [attention, setAttention] = useState<AttentionProps | undefined>();
  const [imune, setImune] = useState(false);
  const userId = user?._id;  
  const router = useRouter();

  const getCurrentAttention = async () => {
    if (token && user && !imune) {
      const current = await getAttention(token, userId);
      if (current) {
        setAttention(current);
        if (current.importance === 'urgent' || current.importance === 'request') {
          router.push({ pathname: current.page, params: current.parameters || {} });
        }
      } else {
        setAttention(undefined);
      }
    }
  };

  const deleteAttention = async (contractId: string) => {
    if (token && user) {
      await removeAttention(token, userId, contractId);
      setAttention(undefined);
      await getCurrentAttention();
    }
  };

  const addCurrentAttention = async (token: string, user: string, importance: string, page: string, parameters: any = {}) => {
    if (token && user && importance && page) {
      const current = await addAttention(token, user, importance, page, parameters);
      if (current) {
        setAttention(current);
      }
    }
  };

  useEffect(() => {
    if (user) getCurrentAttention();
  }, [user]);

  return { attention, setAttention, getCurrentAttention, addCurrentAttention, deleteAttention, setImune };
};
