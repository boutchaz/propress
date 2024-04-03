import { z } from "zod";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Section } from "@/types/Section"; // Assuming this is correctly imported
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sketch from "@uiw/react-color-sketch";
import { useEffect, useRef } from "react";
import kioskApi from "@/api/kioskApi";
import { QueryClient, useMutation } from "@tanstack/react-query";

const sectionItemSchema = z.object({
  name: z.string(),
  ojdTag: z.string().optional(),
  position: z.number().optional(),
  releaseOffset: z.number().nullable().optional(),
  goalFixedUpon: z.number().nullable().optional(),
  issue: z.string().nullable().optional(),
  publication: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof sectionItemSchema>;

export const SectionEdit = ({ section }: { section: Section }) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(sectionItemSchema),
  });
  const queryClient = new QueryClient();
  const mutation = useMutation({
    mutationFn: async (data: FormValues & { id : number}) => {
      await kioskApi.updateSection(section.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate({ ...data, id: section.id });
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
