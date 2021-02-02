import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Button, TextInput } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function PhoneVerification() {
    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);
  
    const [code, setCode] = useState('');
  
    // Handle user state changes
    function onAuthStateChanged(user) {
      setUser(user);
      if (initializing) setInitializing(false);
    }
  
    // useEffect(() => {
    //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    //   return subscriber; // unsubscribe on unmount
    // }, []);
  
    // Handle create account button press
    // async function createAccount() {
    //   try {
    //     await auth().createUserWithEmailAndPassword(
    //       'jane.doe@example.com',
    //       'SuperSecretPassword!',
    //     );
    //     console.log('User account created & signed in!');
    //   } catch (error) {
    //     if (error.code === 'auth/email-already-in-use') {
    //       console.log('That email address is already in use!');
    //     }
  
    //     if (error.code === 'auth/invalid-email') {
    //       console.log('That email address is invalid!');
    //     }
    //     console.error(error);
    //   }
    // }
  
    // Handle the verify phone button press
    async function verifyPhoneNumber(phoneNumber) {
      const confirmation = await auth().verifyPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    }
  
    // Handle confirm code button press
    async function confirmCode() {
      try {
        const credential = auth.PhoneAuthProvider.credential(
          confirm.verificationId,
          code,
        );
        //let userData = await auth().currentUser.linkWithCredential(credential);
        //setUser(userData.user);
        console.log(credential);
      } catch (error) {
        if (error.code == 'auth/invalid-verification-code') {
          console.log('Invalid code.');
        } else {
          console.log('Account linking error');
        }
      }
    }
  
    //if (initializing) return null;
  
    // if (!user) {
    //   return <><Text numberOfLines={5}>
    //       {"\n"}
    //       {"\n"}
    //       {"\n"}
    //       {"\n"}
    //       {'Login Here'}
    //       </Text>
    //   <Button title="Login" onPress={() => createAccount()} />
    //   </>;
    // } else if (!user.phoneNumber) {
      if (!confirm) {
        return (
            <><Text numberOfLines={5}>
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
          {'Login Here'}
          </Text>
          <Button
            title="Verify Phone Number"
            onPress={() =>
              verifyPhoneNumber('+1 859-420-4030')
            }
          />
          </>
        );
      }
      return (
        <>
        <Text numberOfLines={5}>
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
          {'Login Here'}
          </Text>
          <TextInput value={code} onChangeText={text => setCode(text)} />
          <Button title="Confirm Code" onPress={() => confirmCode()} />
        </>
      );
    // } else {
    //   return (
    //     <>
    //     <Text numberOfLines={5}>
    //       {"\n"}
    //       {"\n"}
    //       {"\n"}
    //       {"\n"}
    //       {'Login Here'}
    //       </Text>
    //     <Text>
    //       Welcome! {user.phoneNumber} linked with {user.email}
    //     </Text>
    //     </>
    //   );
    // }
  }

// export default function PhoneSignIn() {
//     // If null, no SMS has been sent
//     const [confirm, setConfirm] = useState(null);//React.useState<FirebaseAuthTypes.PhoneAuthSnapshot | null>(null);
    
//     const [code, setCode] = React.useState('');
    
//     // Handle the button press
//     async function signInWithPhoneNumber(phoneNumber: string) {
//         console.log(phoneNumber);
//         const confirmation = await auth().verifyPhoneNumber(phoneNumber);
//         // await auth().signInWithPhoneNumber(phoneNumber, true); //
//         console.log(confirmation);
//         setConfirm(confirmation);
//     }
    
//     async function confirmCode() {
//         try {
//             // if (confirm) {
//             //     await confirm.confirm(code);
//             // }
//             const credential = auth.PhoneAuthProvider.credential(
//                 confirm.verificationId,
//                 code,
//               );
//             console.log('success');
//             console.log(credential);
//         } catch (error) {
//             console.log('Invalid code.');
//         }
//     }
    
//     if (!confirm) {
//         const titleText = useState("Bird's Nest");
//         const bodyText = useState("This is not really a bird nest.");
//         return (
//         <>
//         <Text style={styles.baseText}>
//           <Text style={styles.titleText}>
//             {titleText}
//               {"\n"}
//               {"\n"}
//             </Text>
//             <Text numberOfLines={5}>{bodyText}</Text>
//           </Text>
//         <Button
//             title="Phone Number Sign In"
//             onPress={() => signInWithPhoneNumber('+1 859-420-4030')}
//         />
//         </>
//         );
//     }
    
//     return (
//         <>
//         <Button title="Confirm Code" onPress={() => confirmCode()} />
//         <TextInput value={code} onChangeText={text => setCode(text)} />
//         </>
//     );
// }

const styles = StyleSheet.create({
baseText: {
    fontFamily: "Cochin"
},
titleText: {
    fontSize: 20,
    fontWeight: "bold"
}
});