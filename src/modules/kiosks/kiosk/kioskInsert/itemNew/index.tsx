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
import { PublicationsPicker } from "@/components/publications";

const itemSchema = z.object({
  ojdTag: z.string().optional(),
  position: z.number().int().positive().optional(),
  releaseOffset: z.number().nullable().optional(),
  goalFixedUpon: z.number().nullable().optional(),
  publication: z.object({
    value: z.string(),
  }),
});

type FormValues = z.infer<typeof itemSchema>;

export const ItemNew = ({ refetch }: { refetch: () => void }) => {
  const { close, setItemId, itemId } = useDrawerStore();

  const { kiosId } = Route.useParams();
  const methods = useForm<FormValues>({
    resolver: zodResolver(itemSchema),
  });
  const queryClient = new QueryClient();
  const mutation = useMutation({
    mutationFn: async (data: FormValues & { section: string }) => {
      await kioskApi.createItem(data);
    },
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries({ queryKey: ["kiosk-sections"] });
      refetch();
      setItemId(null);
    },
  });
  const onSubmit: SubmitHandler<FormValues> = (data: any) => {
    const sectionID = itemId?.split("_")[2];
    const submissionData = {
      ...data,
      publication: data.publication ? data.publication?.value : null,
    };
    mutation.mutate({
      ...submissionData,
      section: `/api/kiosk/sections/${sectionID}`,
    });
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
            name="publication"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col">
                <PublicationsPicker field={field} />

                {error && <p className="text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <Controller
            data-vaul-no-drag
            name="ojdTag"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col">
                <Input {...field} placeholder="OJD Tag" />
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
          <Controller
            data-vaul-no-drag
            name="releaseOffset"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col">
                <Input
                  {...field}
                  value={field.value ? field.value.toString() : ""}
                  type="number" // Ensuring type number for consistency
                  placeholder="Release Offset"
                />
                {error && <p className="text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <Controller
            data-vaul-no-drag
            name="goalFixedUpon"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col">
                <Input
                  {...field}
                  value={field.value ? field.value.toString() : ""}
                  type="number" // Ensuring type number for consistency
                  placeholder="Goal Fixed Upon"
                  data-vaul-no-drag
                />
                {error && <p className="text-red-500">{error.message}</p>}
              </div>
            )}
          />
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
