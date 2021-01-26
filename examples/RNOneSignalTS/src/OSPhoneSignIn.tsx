import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function PhoneSignIn() {
    // If null, no SMS has been sent
    const [confirm, setConfirm] = React.useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
    
    const [code, setCode] = React.useState('');
    
    // Handle the button press
    async function signInWithPhoneNumber(phoneNumber: string) {
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        setConfirm(confirmation);
    }
    
    async function confirmCode() {
        try {
        if (confirm != null) {
            await confirm.confirm(code);
        }
        } catch (error) {
        console.log('Invalid code.');
        }
    }
    
    if (!confirm) {
        return (
        <Button
            title="Phone Number Sign In"
            onPress={() => signInWithPhoneNumber('+1 650-555-3434')}
        />
        );
    }
    
    return (
        <>
        <TextInput value={code} onChangeText={text => setCode(text)} />
        <Button title="Confirm Code" onPress={() => confirmCode()} />
        </>
    );
}