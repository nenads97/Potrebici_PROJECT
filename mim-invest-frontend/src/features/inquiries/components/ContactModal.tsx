import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";

import {
  ContactModalContext,
  defaultModalOptions,
  useContactModal,
  type ContactModalOptions,
} from "./ContactModalContext";

const ContactModalDialog = lazy(() => import("./ContactModalDialog"));

export const ContactModalProvider = ({ children }: PropsWithChildren) => {
  const [modalOptions, setModalOptions] = useState<ContactModalOptions>(defaultModalOptions);
  const [modalRenderKey, setModalRenderKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const openContactModal = useCallback((options: ContactModalOptions = {}) => {
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalOptions({ ...defaultModalOptions, ...options });
    setModalRenderKey((currentKey) => currentKey + 1);
    setIsOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    lastFocusedElementRef.current?.focus({ preventScroll: true });
    lastFocusedElementRef.current = null;
    return undefined;
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({ openContactModal, closeContactModal }),
    [closeContactModal, openContactModal],
  );

  return (
    <ContactModalContext.Provider value={contextValue}>
      {children}
      {isOpen ? (
        <Suspense
          fallback={
            <div className="contact-modal__loading" role="status">
              Učitavanje forme…
            </div>
          }
        >
          <ContactModalDialog
            key={modalRenderKey}
            isOpen={isOpen}
            onClose={closeContactModal}
            options={modalOptions}
          />
        </Suspense>
      ) : null}
    </ContactModalContext.Provider>
  );
};

type ContactModalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  modalOptions?: ContactModalOptions;
  children: ReactNode;
};

export const ContactModalButton = ({
  children,
  className,
  modalOptions,
  onClick,
  type = "button",
  ...buttonProps
}: ContactModalButtonProps) => {
  const { openContactModal } = useContactModal();
  const buttonClassName = ["contact-modal-button", className].filter(Boolean).join(" ");

  return (
    <button
      {...buttonProps}
      className={buttonClassName}
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          openContactModal(modalOptions);
        }
      }}
    >
      {children}
    </button>
  );
};
