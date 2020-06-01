import React, {createContext, useState, useEffect} from 'react';
import {getUserSetting} from '../utils/usestorage';

type UserSettingContextProps = {
  sort: number;
  setSort: (sort: number) => void;
};
export const UserSettingContext = createContext<UserSettingContextProps>({
  sort: 0,
  setSort: (sort: number) => {},
});

const {Provider} = UserSettingContext;

export default ({children}: {children: React.ReactElement}) => {
  const [sortData, setSortData] = useState(0);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userSetting = await getUserSetting();
        setSortData(userSetting.sort);
      } catch (e) {
        console.error(e);
      }
    };

    bootstrapAsync();
  }, []);
  const setSort = (sort: number) => {
    setSortData(sort);
    // saveUserSetting({sort});
  };
  return (
    <Provider
      value={{
        sort: sortData,
        setSort,
      }}>
      {children}
    </Provider>
  );
};
