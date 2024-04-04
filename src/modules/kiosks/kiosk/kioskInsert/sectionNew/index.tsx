import { z } from "zod";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sketch from "@uiw/react-color-sketch";
import { useEffect } from "react";
import kioskApi from "@/api/kioskApi";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useDrawerStore } from "@/hooks/useDrawer";
import { Route } from "@/routes/kiosks.$kiosId";

const sectionItemSchema = z.object({
  name: z.string(),
  position: z.number().optional(),
  color: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof sectionItemSchema>;

export const SectionNew = ({ refetch }: { refetch: () => void }) => {
  const { close, setItemId } = useDrawerStore();
  const { kiosId } = Route.useParams();
  const methods = useForm<FormValues>({
    resolver: zodResolver(sectionItemSchema),
  });
  const queryClient = new QueryClient();
  const mutation = useMutation({
    mutationFn: async (data: FormValues & { kiosk: string }) => {
      await kioskApi.createSection(data);
    },
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries({ queryKey: ["kiosk-sections"] });
      refetch();
      setItemId(null);
    },
  });
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate({ ...data, kiosk: `/api/kiosks/${kiosId}` });
  };
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".w-color-interactive.w-color-saturation"
    );
    elements.forEach((element) => {
      element.setAttribute("data-vaul-no-drag", "true");
    });
  }, []);
  return (
    <FormProvider {...methods} data-vaul-no-drag>
      <form onSubmit={methods.handleSubmit(onSubmit)} data-vaul-no-drag>
        <div className="grid grid-cols-2 gap-4 my-8" data-vaul-no-drag>
          <Controller
            data-vaul-no-drag
            name="name"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <Input {...field} placeholder="Name" />
                {error && <p className="text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <Controller
            data-vaul-no-drag
            name="position"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col">
                <Input
                  {...field}
                  type="number"
                  placeholder="Position"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {error && <p className="text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <div data-vaul-no-drag className="w-full">
            <Controller
              data-vaul-no-drag
              name="color"
              control={methods.control}
              render={({ field }) => (
                <div data-vaul-no-drag className="w-full flex gap-8 flex-col">
                  <Sketch
                    data-vaul-no-drag
                    style={{ marginLeft: 20 }}
                    onChange={(color) => field.onChange(color.hex)}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div
          data-vaul-no-drag
          className="flex justify-center items-center w-full mt-8"
        >
          <Button data-vaul-no-drag type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
