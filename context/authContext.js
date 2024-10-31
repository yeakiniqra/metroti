import { createContext, useState, useEffect, useContext } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();


// AuthContextProvider for Firebase Auth
export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

// Check if user is already logged in or not
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // console.log('User: ', user);
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                updateUserData(user.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.log('user null');
            }

        });

        return unsubscribe;

    }, []);

// Update User Data
const updateUserData = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let data = docSnap.data();
        setUser({ ...user, username: data.username, contact: data.contact, userId: data.userId });
         
    } else {
        console.log('No such document!');
    }
}



// Login User
    const login = async (email, password) => {
        try {
           const response = await signInWithEmailAndPassword(auth, email, password);
            
            return { success: true, message: 'User Logged in successfully', data: response?.user };
        } catch (error) {
            let msg = error.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Please Provide a valid email';
            if (msg.includes('(auth/user-not-found)')) msg = 'User not found';
            if (msg.includes('(auth/wrong-password)')) msg = 'Invalid Password';
            return { success: false, msg };
        }
    };

// Logout User
    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true, message: 'User Logged out successfully' };
        } catch (error) {
            return { success: false, message: 'Something went wrong' };
        }
    };

// Register User
    const register = async (email, password, username, contact) => {

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            // console.log('User registered successfully: ', response?.user);

            await setDoc(doc(db, 'users', response?.user?.uid), {
                username,
                contact,
                userId: response?.user?.uid,
            })
            return { success: true, message: 'User Saved successfully', data: response?.user };
        } catch (error) {
            let msg = error.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Please Provide a valid email';
            if (msg.includes('(auth/email-already-in-use)')) msg = 'Please use another email address';
            return { success: false, msg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );

};


// Custom Hook
export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return value;
};