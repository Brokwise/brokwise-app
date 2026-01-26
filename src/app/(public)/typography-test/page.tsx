import { Typography } from "@/components/ui/typography";

export default function TypographyTestPage() {
    return (
        <div className="p-10 max-w-4xl mx-auto space-y-10">
            <div className="space-y-4">
                <Typography variant="h1">Typography System Check</Typography>
                <Typography variant="lead">
                    This page demonstrates the new strict typography scale using the Inter font family.
                </Typography>
            </div>

            <div className="grid gap-8 p-6 border rounded-lg">
                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">h1 (Page Title)</span>
                    <Typography variant="h1">The Quick Brown Fox Jumps Over The Lazy Dog</Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">h2 (Section Header)</span>
                    <Typography variant="h2">Dashboard Overview</Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">h3 (Card Title)</span>
                    <Typography variant="h3">Revenue Analytics</Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">h4 (Subsection)</span>
                    <Typography variant="h4">User Retention Rates</Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">p (Body)</span>
                    <Typography variant="p">
                        Efficiently unleash cross-media information without cross-media value.
                        Quickly maximize timely deliverables for real-time schemas. Dramatically maintain
                        clicks-and-mortar solutions without functional solutions.
                    </Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">large (Lead/Emphasized)</span>
                    <Typography variant="large">
                        Total Active Users: 12,345
                    </Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">small (Meta/Caption)</span>
                    <Typography variant="small">
                        Last updated: Oct 24, 2025 at 10:30 AM
                    </Typography>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono">muted (Utility)</span>
                    <Typography variant="muted">
                        This is secondary text used for less important information.
                    </Typography>
                </div>
            </div>
        </div>
    );
}
