import React from "react";
import { Input, Button, Divider, Row, Col, Space } from "antd";
import { MailOutlined, PhoneOutlined, FacebookOutlined, InstagramOutlined, TwitterOutlined, LinkedinOutlined } from "@ant-design/icons";

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    
    if (email) {
      // Here you would typically handle the subscription
      alert("Đăng ký thành công! Cảm ơn bạn đã đăng ký nhận bản tin.");
      e.target.reset();
    }
  };

  const paymentIcons = [
    { name: "Visa", src: "https://cdn-icons-png.flaticon.com/512/196/196578.png" },
    { name: "Mastercard", src: "https://cdn-icons-png.flaticon.com/512/196/196561.png" },
    { name: "PayPal", src: "https://cdn-icons-png.flaticon.com/512/196/196565.png" },
    { name: "Apple Pay", src: "https://cdn-icons-png.flaticon.com/512/888/888870.png" },
    { name: "Google Pay", src: "https://cdn-icons-png.flaticon.com/512/6124/6124998.png" },
  ];

  return (
    <footer style={{ background: "#001529", color: "#fff", padding: "48px 0 24px" }} className="mt-10 ">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <Row gutter={[32, 32]}>
          {/* Company Information */}
          <Col xs={24} sm={24} md={12} lg={6}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Shop Name</h3>
            <p style={{ marginBottom: "16px", color: "#a6a6a6" }}>
              Cung cấp các sản phẩm chất lượng cao với giá cả hợp lý và dịch vụ khách hàng tuyệt vời.
            </p>
            <Space direction="vertical" size="small">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PhoneOutlined />
                <span>+84 123 456 789</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MailOutlined />
                <span>contact@yourshop.com</span>
              </div>
            </Space>
          </Col>

          {/* Information Links */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Thông tin</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Về chúng tôi", href: "/" },
                { label: "Chính sách bảo mật", href: "/" },
                { label: "Điều khoản dịch vụ", href: "/" },
                { label: "Liên hệ", href: "/" },
                { label: "Trung tâm hỗ trợ", href: "/" },
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <a href={link.href} style={{ color: "#a6a6a6", textDecoration: "none" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Shopping Links */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Mua sắm</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Sản phẩm mới", href: "/" },
                { label: "Bán chạy nhất", href: "/" },
                { label: "Khuyến mãi", href: "/" },
                { label: "Sản phẩm giảm giá", href: "/" },
                { label: "Thanh toán", href: "/" },
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <a href={link.href} style={{ color: "#a6a6a6", textDecoration: "none" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Newsletter */}
          <Col xs={24} sm={24} md={12} lg={6}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Đăng ký nhận tin</h3>
            <p style={{ marginBottom: "16px", color: "#a6a6a6" }}>
              Đăng ký để nhận các thông tin về sản phẩm mới và khuyến mãi đặc biệt.
            </p>
            <form onSubmit={handleSubscribe}>
              <Space direction="vertical" style={{ width: "100%",  color: "#fff" }}>
                <Input 
                  name="email"
                  type="email" 
                  placeholder="Email của bạn" 
                  required
                  style={{ color: "#fff"}}
                />
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                  Đăng ký
                </Button>
              </Space>
            </form>
          </Col>
        </Row>

        {/* Payment Methods */}
        <div style={{ marginTop: "32px", marginBottom: "24px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Phương thức thanh toán</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {paymentIcons.map((icon, index) => (
              <div 
                key={index} 
                style={{ 
                  background: "white", 
                  borderRadius: "4px", 
                  padding: "8px", 
                  height: "40px", 
                  width: "64px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}
              >
                <img 
                width={30} 
                height={30}
                  src={icon.src} 
                  alt={icon.name} 
                  style={{ height: "24px", objectFit: "contain" }} 
                />
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ background: "#003a6c", margin: "24px 0" }} />

        {/* Bottom Section */}
        <Row justify="space-between" align="middle" style={{ flexWrap: "wrap", gap: "16px" }}>
          <Col>
            <p style={{ color: "#a6a6a6", fontSize: "14px", margin: 0 }}>
              &copy; {new Date().getFullYear()} Shop Name. Tất cả các quyền được bảo lưu.
            </p>
          </Col>
          
          <Col>
            <Space size="middle">
              <a href="/" style={{ color: "#a6a6a6" }}>
                <FacebookOutlined style={{ fontSize: "20px" }} />
              </a>
              <a href="/" style={{ color: "#a6a6a6" }}>
                <InstagramOutlined style={{ fontSize: "20px" }} />
              </a>
              <a href="/" style={{ color: "#a6a6a6" }}>
                <TwitterOutlined style={{ fontSize: "20px" }} />
              </a>
              <a href="/" style={{ color: "#a6a6a6" }}>
                <LinkedinOutlined style={{ fontSize: "20px" }} />
              </a>
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;