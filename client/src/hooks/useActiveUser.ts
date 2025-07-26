import { setActiveUser } from "@DAL/redux/reducers/activeUserReducer";
import { useAppDispatch, useAppSelector } from "@DAL/redux/store";
import { getActiveUser, logout } from "@DAL/server-requests/users";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const useActiveUser = () => {
  const reduxUser = useAppSelector((state) => state.activeUser);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { experimentId } = useParams<{ experimentId: string }>();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const fetchedUser = await getActiveUser();
        dispatch(setActiveUser(fetchedUser));

        if (fetchedUser?._id) {
          localStorage.setItem("userId", fetchedUser._id);
        }
      } catch (error: any) {
        // Only silence 401; log other errors
        if (error?.response?.status === 401) {
          dispatch(setActiveUser(null));
        } else {
          console.error("Failed to fetch active user:", error);
          dispatch(setActiveUser(null));
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleLogout = async () => {
      if (
        reduxUser &&
        !reduxUser.isAdmin &&
        reduxUser.experimentId !== experimentId
      ) {
        await logout();
        dispatch(setActiveUser(null));
      }
    };

    if (!reduxUser) {
      fetchUser();
    } else if (experimentId) {
      handleLogout();
    } else {
      setIsLoading(false);
    }
  }, [reduxUser, experimentId, dispatch]);

  return { activeUser: reduxUser, isLoading };
};

export default useActiveUser;
