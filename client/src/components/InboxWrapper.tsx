import { Inbox } from "./Inbox"


interface Users {
    id: string;
    name: string;
    image: string;
  }

export const InboxWrapper:React.FC<Users> = ({id , name , image}) => {
  return (
    <Inbox id={id} name={name} image={image}></Inbox>
  )
}
