import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@tecbunny/ui";

interface CreateProductDialogProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProductCreated: (product: any) => void;
  initialName?: string;
}

                                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
function CreateProductDialog({ open, onClose, onProductCreated: _onProductCreated, initialName: _initialName }: CreateProductDialogProps) {
  // ...existing code for hooks, form, and onSubmit...
  // (Assume hooks and logic are present above)
 return (
     <Dialog open={open} onOpenChange={onClose}>
       <DialogContent className="max-w-3xl">
         <DialogHeader>
           <DialogTitle>Create New Product</DialogTitle>
           <DialogDescription>
             Fill out the form to add a new product to your inventory.
           </DialogDescription>
         </DialogHeader>
         {/* Assume form and fields are present here, as previously implemented */}
       </DialogContent>
     </Dialog>
  );
}

export default CreateProductDialog;