import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Property } from "@/types/property";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export const FlagInAppropriate = ({
    property,
    setIsFlagDialogOpen,
    isFlagDialogOpen
}: { property: Property, setIsFlagDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, isFlagDialogOpen: boolean }) => {

    const [flagReason, setFlagReason] = useState("");
    const [flagNotes, setFlagNotes] = useState("");
    const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

    const handleSubmitFlag = useCallback(async () => {
        if (!flagReason || !property) return;
        setIsSubmittingFlag(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 900));
            toast.success("Thanks for reporting. We'll review this property soon.");
            setIsFlagDialogOpen(false);
            setFlagReason("");
            setFlagNotes("");
        } catch (e) {
            console.error(e);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmittingFlag(false);
        }
    }, [flagReason, property]);

    return <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Flag this property</DialogTitle>
                <DialogDescription>
                    Tell us what seems wrong so we can review this listing.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label htmlFor="flag-reason">Reason</Label>
                    <Select value={flagReason} onValueChange={setFlagReason}>
                        <SelectTrigger id="flag-reason">
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MISLEADING_INFORMATION">
                                Misleading information
                            </SelectItem>
                            <SelectItem value="INCORRECT_PRICING">
                                Incorrect pricing
                            </SelectItem>
                            <SelectItem value="DUPLICATE_LISTING">
                                Duplicate listing
                            </SelectItem>
                            <SelectItem value="SCAM_OR_FRAUD">Scam or fraud</SelectItem>
                            <SelectItem value="SPAM">Spam or promotional</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="flag-notes">Additional details</Label>
                    <Textarea
                        id="flag-notes"
                        value={flagNotes}
                        onChange={(e) => setFlagNotes(e.target.value)}
                        placeholder="Share any details that help us investigate."
                        className="min-h-[96px]"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => setIsFlagDialogOpen(false)}
                    disabled={isSubmittingFlag}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmitFlag}
                    disabled={!flagReason || isSubmittingFlag}
                >
                    {isSubmittingFlag ? "Submitting..." : "Submit report"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

}