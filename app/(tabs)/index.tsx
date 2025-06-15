import React from 'react'
import { View } from 'react-native'
import QuizHome from '../../components/Quiz/QuizHome';
import { useSelector } from 'react-redux';

function index() {
  const { user } = useSelector((state: any) => state.auth);
  return (
    <View>
      <QuizHome />
    </View>
  )
}

export default index
