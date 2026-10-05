import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

// We explicitly type the storage so it works correctly with async-storage
const storage = createJSONStorage<string>(() => AsyncStorage);

// Store the user locale preference, default to 'en'
export const languageAtom = atomWithStorage<string>('app-language', 'en', storage);
