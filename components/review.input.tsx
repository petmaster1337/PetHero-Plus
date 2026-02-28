import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors, latitudo } from '@/constants/Constants';
import { storeReview, reviewExists } from '@/services/review.service';

export default function ReviewInput({title, onSubmit, target, sender, contract}: Readonly<{ title: string, onSubmit: any, target: any, sender: string, contract: string }>) {
  const [ rating, setRating ] = useState(0);
  const [ ratingTitle, setRatingTitle ] = useState<string>('');
  const [ description, setDescription ] = useState<string>('');
  const [ exists, setExists] = useState<boolean | null>();

  
  useEffect(() => {
    (async() => {
      const rev = await reviewExists(contract, target?.id);
      setExists(rev);
    })();
  }, [])
  
  const generateReviewUid = () => {
    return `${Math.floor(Math.pow(32, 5) * Math.random()).toString(32)}${Math.floor(Math.pow(32, 5) * Math.random()).toString(16)}${Math.floor(Math.pow(32, 5) * Math.random()).toString(32)}`;
  }

  const handleSubmit = async () => {
  if (!rating) return;

  Alert.alert(
    'Confirm Review ?','',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Submit',
        onPress: async () => {
          const data = {
            uid: generateReviewUid(),
            description,
            grade: Number(rating) * 2,
            type: target.type,
            typeId: target.id,
            sender: sender,
            contract: contract,
          };

          try {
            const answer = await storeReview(data);

            setExists(true);
            onSubmit({ rating, title, description });

            setRating(0);
            setRatingTitle('');
            setDescription('');
          } catch (err) {
            console.error('Error storing review:', err);
            Alert.alert('Error', 'Something went wrong while submitting your review.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  return (
    <View style={styles.container}>
      {!exists ?
      (

        <View>
              <Text style={styles.heading}>{ title }</Text>

              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <FontAwesome
                      name={rating >= star ? 'star' : 'star-o'}
                      size={32}
                      color={rating >= star ? '#FFD700' : '#ccc'}
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Review title"
                placeholderTextColor={Colors.g3}
                value={ratingTitle}
                onChangeText={setRatingTitle}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Write your review..."
                placeholderTextColor={Colors.g3}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  !(rating) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!(rating)}
              >
                <Text style={styles.buttonText}>Submit Review</Text>
              </TouchableOpacity>

        </View>
      ):
      
      (
        <View style={{width: '100%', height: latitudo(30)}}>
            <Text style={{fontSize: 24, color: Colors.primary, fontFamily: 'mon-b', verticalAlign: 'middle', textAlign: 'center', height: '100%', width: '100%'}}>Review Submitted!</Text>
          </View>
      )
      } 
    </View>
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
