import { create } from 'zustand';

type ColorConvertorState = {
  color: string; // The 'color' state is a string
  setColor: (newColor: string) => void; // 'setColor' is a function that updates 'color'
};

const useColorConvertorStore = create<ColorConvertorState>((set) => ({
  color: "#ff0000", // Default color is red
  setColor: (newColor) => set(() => ({ color: newColor })),
}));

export default useColorConvertorStore;