import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../Store/useAuthStore";

const ContactList = () => {
  const { getAllConatacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllConatacts();
  }, [getAllConatacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? 'avatar-online' : 'offline'}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilepic || "/avatar.png"} alt={contact.fullname} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{contact.fullname}</h4>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default ContactList