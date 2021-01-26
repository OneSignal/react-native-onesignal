import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function PhoneSignIn() {
    // If null, no SMS has been sent
    const [confirm, setConfirm] = React.useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
    
    const [code, setCode] = React.useState('');
    
    // Handle the button press
    async function signInWithPhoneNumber(phoneNumber: string) {
        console.log(phoneNumber);
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber, true);
        console.log(confirmation);
        setConfirm(confirmation);
    }
    
    async function confirmCode() {
        try {
            if (confirm) {
                await confirm.confirm('123456');
            }
            console.log('success');
        } catch (error) {
            console.log('Invalid code.');
        }
    }
    
    if (!confirm) {
        return (
        <Button
            title="Phone Number Sign In"
            onPress={() => signInWithPhoneNumber('+1 123-456-7890')}
        />
        );
    }
    
    return (
        <>
        <TextInput value={'123456'} onChangeText={text => setCode('123456')} />
        <Button title="Confirm Code" onPress={() => confirmCode()} />
        </>
    );
}