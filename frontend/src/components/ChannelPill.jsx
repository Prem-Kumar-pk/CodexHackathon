import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import PublicIcon from "@mui/icons-material/Public";
import { Chip } from "@mui/material";

const iconMap = {
  Email: <EmailIcon fontSize="small" />,
  Chat: <ChatIcon fontSize="small" />,
  "Social Media": <PublicIcon fontSize="small" />,
  "Phone Transcript": <PhoneInTalkIcon fontSize="small" />
};

export default function ChannelPill({ channel }) {
  return <Chip size="small" icon={iconMap[channel]} label={channel} variant="outlined" />;
}
