import { useMutation } from "@tanstack/react-query";
import kiosApi from "@/api/kioskApi";

interface LoginArgs {
  username: string;
  password: string;
}

const useLoginMutation = () => {
  return useMutation({
    mutationFn: ({ username, password }: LoginArgs) => {
      return kiosApi.login(username, password);
    },
  });
};

export default useLoginMutation;
