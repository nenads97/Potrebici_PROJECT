import type { PropsWithChildren } from "react";

import { ContactModalProvider } from "../../features/inquiries/components/ContactModal";

const AppProviders = ({ children }: PropsWithChildren) => {
  return <ContactModalProvider>{children}</ContactModalProvider>;
};

export default AppProviders;
