import { cn, SizeInRem } from "@/lib/utils";

type Props = {
  type?: "disc" | "dot";
  className?: string;
} & (
  | {
      size: SizeInRem;
    }
  | {
      width: SizeInRem | "auto";
      height: SizeInRem | "auto";
    }
);

export const Loader: React.FC<Props> = ({
  className,
  type = "disc",
  ...props
}) => {
  return type === "disc" ? (
    <div
      className={cn(
        "border-3 border-solid border-gray-300 dark:border-gray-600 border-b-[transparent] rounded-full animate-spin",
        className
      )}
      style={{
        minWidth: "width" in props ? props.width : props.size,
        minHeight: "height" in props ? props.height : props.size,
        height: "height" in props ? props.height : props.size,
        width: "width" in props ? props.width : props.size,
      }}
    ></div>
  ) : (
    <div
      className={cn(
        "grid grid-cols-3 justify-center items-center gap-[0.3rem]",
        className
      )}
      style={{
        minWidth: "size" in props ? props.size : props.width ?? "2.5rem",
        minHeight: "size" in props ? props.size : props.height ?? "2.5rem",
      }}
    >
      <div className="relative rounded-full aspect-square bg-gray-400 dark:bg-gray-500 animate-bounce size-[5px]"></div>
      <div className="relative rounded-full aspect-square bg-gray-400 dark:bg-gray-500 animate-bounce size-[5px] [animation-delay:250ms]"></div>
      <div className="relative rounded-full aspect-square bg-gray-400 dark:bg-gray-500 animate-bounce size-[5px] [animation-delay:500ms]"></div>
    </div>
  );
};
