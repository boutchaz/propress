import { AUTH_STATE_KEY, useAuth } from "@/contexts/AuthContext";
import useLoginMutation from "@/hooks/useLogin";
import { useRouter } from "@tanstack/react-router";
import localForage from "localforage";
import { useForm } from "react-hook-form";

const SignIn = () => {
  const mutation = useLoginMutation();
  const router = useRouter();
  const { setAuthInfo, authState } = useAuth();
  const { register, handleSubmit, control } = useForm();
  const onSubmit = async (data: any) => {
    try {
      mutation.mutate(data, {
        onSuccess: async ({ token, refresh_token }) => {
          await setAuthInfo({ token, refreshToken: refresh_token });
          await localForage.setItem(AUTH_STATE_KEY, {
            token,
            refreshToken: refresh_token,
          }); // Save the new authInfo directly
          router.navigate({
            to: "/",
          });
        },
        onError: (error) => {
          console.log(error);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen g-6 flex h-full text-neutral-800 dark:text-neutral-200 container h-full flex	 items-center justify-center">
      <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800 px-4 md:px-0 lg:w-6/12 mx-auto">
        <div className="md:mx-6 md:p-12">
          <img
            className="mx-auto w-52 my-4"
            src="https://groupepropress.fr/wp-content/uploads/2021/05/Logo-groupe-Propress_bas.png"
            alt="logo"
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-4 text-center">Connexion</p>
            <div className="relative mb-4" data-te-input-wrapper-init>
              <input
                type="text"
                className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.5rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                id="inputUsername"
                placeholder="xxx@groupepropress.fr"
                autoComplete="email"
                autoFocus
                {...register("username", { required: true })}
              />
              <label
                htmlFor="inputUsername"
                className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
              >
                Identifiant
              </label>
            </div>

            <div className="relative mb-4" data-te-input-wrapper-init>
              <input
                type="password"
                className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.5rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                id="inputPassword"
                placeholder="Mot de passe"
                {...register("password", { required: true })}
              />
              <label
                htmlFor="inputPassword"
                className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
              >
                Mot de passe
              </label>
            </div>

            <input
              type="hidden"
              name="_csrf_token"
              value="{{ csrf_token('authenticate') }}"
            />

            <div className="py-1 text-center">
              <button
                className="mb-10 bg-primary-700 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                type="submit"
                data-te-ripple-init
                data-te-ripple-color="light"
              >
                se connecter
              </button>
              <a href="#" className="text-sm underline">
                Mot de passe oublié?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SignIn;
