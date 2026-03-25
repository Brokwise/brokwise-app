import { useState, useEffect, useCallback } from "react";

/**
 * Manages step-level validation state for wizard forms.
 * When validation fails, this hook:
 * 1. Sets a flag that forces FormLabel/FormControl/FormMessage to show errors
 *    (even for untouched fields) via FormStepValidationContext
 * 2. After React re-renders with error indicators visible, scrolls to the
 *    first errored field and applies a shake animation to all errored fields
 */
export function useWizardStepValidation(currentStep: number) {
  const [stepValidationAttempted, setStepValidationAttempted] = useState(false);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  useEffect(() => {
    setStepValidationAttempted(false);
  }, [currentStep]);

  useEffect(() => {
    if (scrollTrigger === 0) return;

    const timer = setTimeout(() => {
      const allInvalid = document.querySelectorAll<HTMLElement>(
        '[aria-invalid="true"]'
      );
      if (allInvalid.length === 0) return;

      const first = allInvalid[0];
      const firstFormItem =
        first.closest<HTMLElement>("[data-form-item]") || first;
      firstFormItem.scrollIntoView({ behavior: "smooth", block: "center" });

      if (first instanceof HTMLInputElement || first instanceof HTMLTextAreaElement || first instanceof HTMLSelectElement) {
        setTimeout(() => first.focus(), 350);
      }

      allInvalid.forEach((el) => {
        const formItem =
          el.closest<HTMLElement>("[data-form-item]") || el;
        formItem.classList.remove("animate-shake-error");
        void formItem.offsetWidth;
        formItem.classList.add("animate-shake-error");
        const cleanup = () => {
          formItem.classList.remove("animate-shake-error");
          formItem.removeEventListener("animationend", cleanup);
        };
        formItem.addEventListener("animationend", cleanup);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollTrigger]);

  const onValidationFailed = useCallback(() => {
    setStepValidationAttempted(true);
    setScrollTrigger((prev) => prev + 1);
  }, []);

  return { stepValidationAttempted, onValidationFailed };
}
