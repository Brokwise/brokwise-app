import useCredits, { useGetCreditPrices } from "@/hooks/useCredits"
import { useGetRemainingQuota } from "@/hooks/useSubscription"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Coins, Loader2 } from "lucide-react"

export const SubmitPropertyUseCredits = ({
    shouldUseCredits,
    setShouldUseCredits
}: {
    shouldUseCredits: boolean,
    setShouldUseCredits: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const { remaining, tier, isLoading: isLoadingQuota } = useGetRemainingQuota()
    const { balance, isLoading: isLoadingCredits } = useCredits()
    const { prices, isLoading: isLoadingPrices } = useGetCreditPrices()

    if (isLoadingQuota || isLoadingCredits || isLoadingPrices) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    }

    if (!remaining) {
        return null
    }

    if (remaining.submit_property_enquiry > 0) {
        return null
    }

    const listingCost = prices.SUBMIT_PROPERTY_ENQUIRY
    const hasEnoughCredits = balance >= listingCost

    return (
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>{tier} limit exhausted</span>
            </div>

            {hasEnoughCredits ? (
                <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
                    <Switch
                        id="use-credits"
                        checked={shouldUseCredits}
                        onCheckedChange={setShouldUseCredits}
                    />
                    <Label htmlFor="use-credits" className="text-sm cursor-pointer flex items-center gap-1.5">
                        <span>Use <span className="font-bold text-primary">{listingCost}</span> credits</span>
                        <span className="text-muted-foreground text-xs border-l pl-1.5 ml-0.5">Bal: {balance}</span>
                    </Label>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20">
                    <span className="text-destructive">Need {listingCost} credits</span>
                    <Link
                        href="/credits"
                        className="text-primary hover:underline font-medium flex items-center gap-1"
                        target="_blank"
                    >
                        <Coins className="h-3 w-3" />
                        Buy Credits
                    </Link>
                </div>
            )}
        </div>
    )
}
