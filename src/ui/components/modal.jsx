import { useEffect } from "react";
import { Icon } from "@iconify/react";

const TYPE_MAP = {
	warning: {
		icon: "ph:warning-fill",
		iconBg: "bg-amber-500",
		confirmBtn: "bg-amber-600 hover:bg-amber-700",
	},
	danger: {
		icon: "ph:sign-out-bold",
		iconBg: "bg-red-500",
		confirmBtn: "bg-red-600 hover:bg-red-700",
	},
	info: {
		icon: "ph:info-fill",
		iconBg: "bg-blue-500",
		confirmBtn: "bg-blue-600 hover:bg-blue-700",
	},
};

export default function Modal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	submittingText = "Processing...",
	cancelText = "Cancel",
	isSubmitting = false,
	type = "warning",
}) {
	const mode = TYPE_MAP[type] || TYPE_MAP.warning;

	useEffect(() => {
		if (!isOpen) return undefined;

		const prevOverflow = document.body.style.overflow;
		const onEsc = (event) => {
			if (event.key === "Escape" && !isSubmitting) onClose();
		};

		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", onEsc);

		return () => {
			document.body.style.overflow = prevOverflow;
			document.removeEventListener("keydown", onEsc);
		};
	}, [isOpen, isSubmitting, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-0">
			<button
				type="button"
				aria-label="Close modal backdrop"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={isSubmitting ? undefined : onClose}
			/>

			<div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-5 sm:p-6">
				<button
					type="button"
					onClick={onClose}
					disabled={isSubmitting}
					className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
				>
					<Icon icon="ph:x-bold" className="h-5 w-5" />
				</button>

				<div className="flex items-start gap-3 pr-6">
					<div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-white ${mode.iconBg}`}>
						<Icon icon={mode.icon} className="h-5 w-5" />
					</div>
					<div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
						<p className="mt-1 text-sm text-gray-600 leading-relaxed">{message}</p>
					</div>
				</div>

				<div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isSubmitting}
						className={`w-full sm:w-auto rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${mode.confirmBtn}`}
					>
						{isSubmitting ? submittingText : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
