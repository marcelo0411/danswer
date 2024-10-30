"use client";
import { ChatPage } from "./ChatPage";
import FunctionalWrapper from "./shared_chat_search/FunctionalWrapper";

export default function WrappedChat({
  initiallyToggled,
}: {
  initiallyToggled: boolean;
}) {
  return (
    <FunctionalWrapper
      initiallyToggled={initiallyToggled}
      content={(toggledSidebar, toggle, isResponsive) => (
        <ChatPage toggle={toggle} toggledSidebar={toggledSidebar} isResponsive={isResponsive}/>
      )}
    />
  );
}
