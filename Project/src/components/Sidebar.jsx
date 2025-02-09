import { SearchOutlined } from "@ant-design/icons";
import { Col, Form, Input, Row } from "antd";
import { BiLogoVenmo, BiSolidBank } from "react-icons/bi";
import {
  BsClipboardData,
  BsCreditCardFill,
  BsCurrencyBitcoin,
  BsPersonCircle,
  BsStack,
} from "react-icons/bs";
import {
  FaDiscord,
  FaEthereum,
  FaExpeditedssl,
  FaInstagram,
  FaPaypal,
  FaPhoneAlt,
  FaRegBuilding,
  FaSitemap,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaSquareFacebook } from "react-icons/fa6";
import { FiLink } from "react-icons/fi";
import { GoGlobe } from "react-icons/go";
import { HiOutlinePhotograph } from "react-icons/hi";
import {
  MdAccountBalanceWallet,
  MdCurrencyBitcoin,
  MdDns,
  MdForum,
  MdGroup,
  MdOutlineAccountBalance,
  MdOutlineAlternateEmail,
  MdOutlineMarkEmailUnread,
  MdOutlinePassword,
} from "react-icons/md";
import { RiLockPasswordFill, RiPagesFill } from "react-icons/ri";
import { SiCashapp, SiLitecoin, SiSolana } from "react-icons/si";
import { TiGroup } from "react-icons/ti";
import { useDnD } from "./DnDContext";

const Sidebar = ({ isSidebar }) => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={`${isSidebar ? "sidebar_open" : "sidebar_close"}`}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        // style={{ maxWidth: 360 }}
        className="max-w-[100%]"
        // onFinish={onFinish}
      >
        <Row>
          <Col span={24}>
            <Form.Item
              name="username"
              className="w-[100%] relative"
              // rules={[
              //   { required: true, message: "Please input your Username!" },
              // ]}
            >
              <div className="flex items-center p-1 rounded-sm space-x-2 absolute top-[2px] z-10">
                <select
                  className="bg-gray-600 text-gray-300 text-sm rounded-md focus:outline-none focus:ring-1 cursor-pointer"
                  defaultValue="Username"
                >
                  <option>Username</option>
                  <option>Phone</option>
                  <option>Image</option>
                  <option>IP</option>
                  <option>Full Name</option>
                  <option>Email</option>
                  <option>Social Media</option>
                  <option>Profile</option>
                  <option>Keyword</option>
                  <option>Address</option>
                  <option>Domain</option>
                </select>
              </div>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Filter by keywords..."
                className="bg-gray-700 graph_filter_input"
                style={{
                  background: "rgb(55 65 81)",
                  color: "gray",
                  paddingLeft: "91px",
                }}
              />
              <div className="text-center">
                <SearchOutlined
                  className="text-center flex items-center justify-center mt-5 text-white bg-orange-400 p-2 rounded-[50%] cursor-pointer"
                  style={{ color: "white" }}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div className="description">
        <p className="text-white font-bold text-xl">
          Personal{" "}
          <span className="font-bold text-gray-500 text-[14px]">(10)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "phone")}
          draggable
        >
          <FaPhoneAlt className="personal_node" />
          <p className="text-gray-200 text-[13px]">Phone</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "email")}
          draggable
        >
          <MdOutlineMarkEmailUnread className="personal_node" />
          <p className="text-gray-200 text-[13px]">Email</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "username")}
          draggable
        >
          <MdOutlineAlternateEmail className="personal_node" />
          <p className="text-gray-200 text-[13px]">Username</p>
        </div>
        {/* <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "instagram")}
          draggable
        >
          <FaInstagram className="personal_node" />
          <p className="text-gray-200 text-[13px]">Instagram</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "facebook")}
          draggable
        >
          <FaSquareFacebook className="personal_node" />
          <p className="text-gray-200 text-[13px]">Facebook</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "telegram")}
          draggable
        >
          <FaTelegramPlane className="personal_node" />
          <p className="text-gray-200 text-[13px]">Telegram</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "discord")}
          draggable
        >
          <FaDiscord className="personal_node" />
          <p className="text-gray-200 text-[13px]">Discord</p>
        </div> */}
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "person")}
          draggable
        >
          <BsPersonCircle className="personal_node" />
          <p className="text-gray-200 text-[13px]">Person</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "photo")}
          draggable
        >
          <HiOutlinePhotograph className="personal_node" />
          <p className="text-gray-200 text-[13px]">Photo</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "group")}
          draggable
        >
          <TiGroup className="personal_node" />
          <p className="text-gray-200 text-[13px]">Group</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "association")}
          draggable
        >
          <MdGroup className="personal_node" />
          <p className="text-gray-200 text-[13px]">Association</p>
        </div>
        {/* <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "forums")}
          draggable
        >
          <MdForum className="personal_node" />
          <p className="text-gray-200 text-[13px]">Forums</p>
        </div> */}
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "account")}
          draggable
        >
          <MdAccountBalanceWallet className="personal_node" />
          <p className="text-gray-200 text-[13px]">Account</p>
        </div>
        {/* <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "darkweb")}
          draggable
        >
          <RiPagesFill className="personal_node" />
          <p className="text-gray-200 text-[13px]">Darkweb</p>
        </div> */}
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "waybackmachine")}
          draggable
        >
          <MdOutlineAccountBalance className="personal_node" />
          <p className="text-gray-200 text-[11px]">Waybackmachine</p>
        </div>
        {/* <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <BsCurrencyBitcoin className="personal_node" />
          <p className="text-gray-200 text-[13px]">Bitcoin</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <FaEthereum className="personal_node" />
          <p className="text-gray-200 text-[13px]">Ethereum</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "solana")}
          draggable
        >
          <SiSolana className="personal_node" />
          <p className="text-gray-200 text-[13px]">Solana</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <SiLitecoin className="personal_node" />
          <p className="text-gray-200 text-[13px]">Lite Coin</p>
        </div> */}
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ip")}
          draggable
        >
          <GoGlobe className="personal_node" />
          <p className="text-gray-200 text-[13px]">IP</p>
        </div>
      </div>

      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Social{" "}
          <span className="font-bold text-gray-500 text-[14px]">(6)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "instagram")}
          draggable
        >
          <FaInstagram className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Instagram</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "facebook")}
          draggable
        >
          <FaSquareFacebook className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Facebook</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "telegram")}
          draggable
        >
          <FaTelegramPlane className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Telegram</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "discord")}
          draggable
        >
          <FaDiscord className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Discord</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "forums")}
          draggable
        >
          <MdForum className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Forums</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "darkweb")}
          draggable
        >
          <RiPagesFill className="personal_node social_node" />
          <p className="text-gray-200 text-[13px]">Darkweb</p>
        </div>
      </div>

      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Crypto{" "}
          <span className="font-bold text-gray-500 text-[14px]">(4)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <BsCurrencyBitcoin className="personal_node crypto_node" />
          <p className="text-gray-200 text-[13px]">Bitcoin</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <FaEthereum className="personal_node crypto_node" />
          <p className="text-gray-200 text-[13px]">Ethereum</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "solana")}
          draggable
        >
          <SiSolana className="personal_node crypto_node" />
          <p className="text-gray-200 text-[13px]">Solana</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <SiLitecoin className="personal_node crypto_node" />
          <p className="text-gray-200 text-[13px]">Lite Coin</p>
        </div>
      </div>
      {/* <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output Node
      </div> */}
      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Financial{" "}
          <span className="font-bold text-gray-500 text-[14px]">(7)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <BiSolidBank className="personal_node financial_node" />
          <p className="text-gray-200 text-[11px]">Bank account</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <FaRegBuilding className="personal_node financial_node" />
          <p className="text-gray-200 text-[13px]">Company</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "solana")}
          draggable
        >
          <BsCreditCardFill className="personal_node financial_node" />
          <p className="text-gray-200 text-[11px]">Credit score</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <MdCurrencyBitcoin className="personal_node financial_node" />
          <p className="text-gray-200 text-[13px]">Crypto</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <FaPaypal className="personal_node financial_node" />
          <p className="text-gray-200 text-[13px]">PayPal</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <SiCashapp className="personal_node financial_node" />
          <p className="text-gray-200 text-[13px]">Cashapp</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <BiLogoVenmo className="personal_node financial_node" />
          <p className="text-gray-200 text-[13px]">Venmo</p>
        </div>
      </div>

      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Dark Web{" "}
          <span className="font-bold text-gray-500 text-[14px]">(4)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <FaSitemap className="personal_node darkweb_node" />
          <p className="text-gray-200 text-[13px]">xss.is</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <BsClipboardData className="personal_node darkweb_node" />
          <p className="text-gray-200 text-[13px]">exploit.in</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "solana")}
          draggable
        >
          <BsStack className="personal_node darkweb_node" />
          <p className="text-gray-200 text-[13px]">Stealer logs</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <MdForum className="personal_node darkweb_node" />
          <p className="text-gray-200 text-[13px]">Forum</p>
        </div>
      </div>

      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Password{" "}
          <span className="font-bold text-gray-500 text-[14px]">(2)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <MdOutlinePassword className="personal_node password_node" />
          <p className="text-gray-200 text-[13px]">Password</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <RiLockPasswordFill
            className="personal_node password_node"
            style={{ marginTop: "-2px" }}
          />
          <p
            className="text-gray-200 text-[9.8px]"
            style={{ marginTop: "3px" }}
          >
            Encrypted Pass
          </p>
        </div>
      </div>

      <div className="description mt-8">
        <p className="text-white font-bold text-xl">
          Web <span className="font-bold text-gray-500 text-[14px]">(4)</span>
        </p>{" "}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "bitcoin")}
          draggable
        >
          <GoGlobe className="personal_node web_node" />
          <p className="text-gray-200 text-[13px]">IP</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "ethereum")}
          draggable
        >
          <FiLink className="personal_node web_node" />
          <p className="text-gray-200 text-[13px]">Url</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "solana")}
          draggable
        >
          <MdDns className="personal_node web_node" />
          <p className="text-gray-200 text-[13px]">DNS</p>
        </div>
        <div
          className="dndnode input flex flex-col items-center"
          onDragStart={(event) => onDragStart(event, "litecoin")}
          draggable
        >
          <FaExpeditedssl
            className="personal_node web_node"
            style={{ marginTop: "-2px" }}
          />
          <p className="text-gray-200 text-[10px]" style={{ marginTop: "3px" }}>
            SSL Certificate
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

//89D2DC
//6564DB
//232ED1
//
//
//
