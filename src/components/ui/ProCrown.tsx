import { Crown } from "lucide-react";

interface ProCrownProps {
    className?: string;
    title?: string;
}

export default function ProCrown({
    className = "w-4 h-4 text-yellow-500 ml-1",
    title = "Pro/Premium",
}: ProCrownProps) {
    return (
        <Crown className={className}>
            <title>{title}</title>
        </Crown>
    );
}
