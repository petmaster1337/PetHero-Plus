import React, { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView } from 'react-native'
import { getReviews } from "@/services/review.service";
import { Colors } from "@/constants/Constants"
import ReviewLine from "@/components/reviewLine";

export default function ReviewList({target}: {target: string}) {
  const [reviews, setReviews] = useState([]);
  
  const targetObj = JSON.parse(String(target));
  useEffect(() => {
    async function getRevs() {
      if (targetObj?.uid) {
        const revs = await getReviews(String(targetObj?.uid));
        setReviews(revs)
      }
    }
    getRevs();
  },[]);


  return (
    <ScrollView nestedScrollEnabled={true} style={{borderWidth: 1,borderRadius: 8, borderColor: Colors.g5, height: 200}}>
      {reviews.length === 0 && (
        <Text style={{margin: 10, color: Colors.g2, fontFamily: 'mon', fontSize: 12}}>No Reviews yet</Text>
      )}
      {reviews.map((item: any, index) => (
        <ReviewLine key={index.toString(16)} data={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  star: {
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
