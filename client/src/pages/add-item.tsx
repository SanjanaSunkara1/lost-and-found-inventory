import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Save, X } from "lucide-react";
import { z } from "zod";

const formSchema = insertItemSchema.extend({
  photo: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddItem() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      location: "",
      priority: "normal",
      staffNotes: "",
      dateFound: new Date().toISOString().split('T')[0] as any,
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value instanceof FileList) {
          if (value.length > 0) {
            formData.append("photo", value[0]);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      return await apiRequest("POST", "/api/items", formData);
    },
    onSuccess: () => {
      toast({
        title: "Item Added Successfully",
        description: "The item has been added to the inventory",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      form.reset();
      setPhotoPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    createItemMutation.mutate(data);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Add New Item</h2>
        <p className="text-muted-foreground">Log a new found item to the inventory</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Item Photo *
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setPhotoPreview(null);
                        form.setValue("photo", undefined);
                      }}
                      data-testid="button-remove-photo"
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <>
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Drag and drop photo here, or click to browse</p>
                    <Button type="button" asChild data-testid="button-choose-photo">
                      <label>
                        Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...form.register("photo")}
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Maximum file size: 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., iPhone 15, Blue Hoodie, Math Textbook"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={form.watch("category")} 
                  onValueChange={(value) => form.setValue("category", value as any)}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="sports">Sports Equipment</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Detailed description including color, size, brand, any identifying marks, condition, etc."
                {...form.register("description")}
                data-testid="textarea-description"
              />
              {form.formState.errors.description && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Location and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">Location Found *</Label>
                <Select 
                  value={form.watch("location")} 
                  onValueChange={(value) => form.setValue("location", value)}
                >
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main-hall">Main Hallway</SelectItem>
                    <SelectItem value="cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="gymnasium">Gymnasium</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="office">Front Office</SelectItem>
                    <SelectItem value="parking">Parking Lot</SelectItem>
                    <SelectItem value="field">Athletic Field</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateFound">Date Found</Label>
                <Input
                  id="dateFound"
                  type="date"
                  {...form.register("dateFound")}
                  data-testid="input-date-found"
                />
              </div>
            </div>

            {/* Priority and Additional Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">Priority Level</Label>
                <RadioGroup 
                  value={form.watch("priority")} 
                  onValueChange={(value) => form.setValue("priority", value as any)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High Priority (valuable items)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="staffNotes">Staff Notes</Label>
                <Textarea
                  id="staffNotes"
                  rows={3}
                  placeholder="Internal notes for staff (not visible to students)"
                  {...form.register("staffNotes")}
                  data-testid="textarea-staff-notes"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createItemMutation.isPending}
                data-testid="button-submit"
              >
                <Save className="mr-2 h-4 w-4" />
                {createItemMutation.isPending ? "Adding..." : "Add to Inventory"}
              </Button>
              
              <Button 
                type="button" 
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  form.reset();
                  setPhotoPreview(null);
                }}
                data-testid="button-cancel"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
