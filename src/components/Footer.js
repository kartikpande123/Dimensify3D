import React from 'react';
import { Instagram, Youtube, Facebook, Linkedin, Twitter, MessageCircle, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: 'about' },
    { name: 'Terms & Conditions', href: '/termsconditions' },
    { name: 'Privacy Policy', href: '/privacypolicy' },
    { name: 'Cancellation Policy', href: '/cancellationRefundpolicy' },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: <Instagram size={22} />, href: '#', color: '#E4405F', hoverColor: '#C13584' },
    { name: 'YouTube', icon: <Youtube size={22} />, href: '#', color: '#FF0000', hoverColor: '#CC0000' },
    { name: 'Facebook', icon: <Facebook size={22} />, href: '#', color: '#1877F2', hoverColor: '#145DBF' },
    { name: 'WhatsApp', icon: <MessageCircle size={22} />, href: '#', color: '#25D366', hoverColor: '#1DA851' },
    { name: 'LinkedIn', icon: <Linkedin size={22} />, href: '#', color: '#0A66C2', hoverColor: '#084F91' },
    { name: 'X (Twitter)', icon: <Twitter size={22} />, href: '#', color: '#000000', hoverColor: '#333333' },
  ];

  return (
    <footer style={styles.footer}>
      {/* Wave Separator */}
      <div style={styles.waveSeparator}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={styles.waveSvg}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#1a1a2e"></path>
        </svg>
      </div>

      <div style={styles.container}>
        {/* Main Footer Content */}
        <div style={styles.footerContent}>
          {/* Company Info */}
          <div style={styles.footerSection}>
            <div style={styles.logoSection}>
              <h2 style={styles.logo} className="logo-glow">Dimensify3D</h2>
              <p style={styles.tagline}>Transforming Ideas into Reality</p>
            </div>
            <p style={styles.description}>
              Making 3D printing accessible, innovative, and impactful for individuals and businesses across India.
            </p>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <Mail size={18} style={styles.contactIcon} />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=print.dimensify3d@gmail.com" target="_blank" rel="noopener noreferrer" style={styles.emailLink} className="email-link">
                  print.dimensify3d@gmail.com
                </a>
              </div>
              <div style={styles.contactItem}>
                <Phone size={18} style={styles.contactIcon} />
                <span>+91 90193 03569</span>
              </div>
              <div style={styles.contactItem}>
                <MapPin size={18} style={styles.contactIcon} />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.footerSection}>
            <h3 style={styles.sectionTitle}>Quick Links</h3>
            <ul style={styles.linkList}>
              {quickLinks.map((link, index) => (
                <li key={index} style={styles.linkItem}>
                  <a href={link.href} style={styles.link} className="footer-link">
                    <ExternalLink size={14} style={styles.linkIcon} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div style={styles.footerSection}>
            <h3 style={styles.sectionTitle}>Our Services</h3>
            <ul style={styles.linkList}>
              <li style={styles.linkItem}>
                <a href="/" style={styles.link} className="footer-link">
                  <ExternalLink size={14} style={styles.linkIcon} />
                  Custom 3D Printing
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/onlinestore" style={styles.link} className="footer-link">
                  <ExternalLink size={14} style={styles.linkIcon} />
                  Online 3D Shop
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/consultancy" style={styles.link} className="footer-link">
                  <ExternalLink size={14} style={styles.linkIcon} />
                  CAD Consultancy
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/help" style={styles.link} className="footer-link">
                  <ExternalLink size={14} style={styles.linkIcon} />
                  Design Solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div style={styles.footerSection}>
            <h3 style={styles.sectionTitle}>Connect With Us</h3>
            <p style={styles.socialText}>Follow us on social media for updates and inspiration</p>
            <div style={styles.socialGrid}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  style={{...styles.socialLink, '--hover-color': social.hoverColor}}
                  className="social-icon"
                  title={social.name}
                  data-color={social.color}
                >
                  <span style={styles.socialIconWrapper}>
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>
            © {currentYear} <span style={styles.brandName}>Dimensify3D</span>. All rights reserved.
          </p>
          <p style={styles.madeWith}>
            Made with <span style={styles.heart}>❤</span> in India
          </p>
        </div>
      </div>

      <style>{`
        /* Logo Glow Effect */
        .logo-glow {
          animation: logo-glow 3s ease-in-out infinite;
        }

        @keyframes logo-glow {
          0%, 100% { text-shadow: 0 0 15px rgba(0, 212, 255, 0.6), 0 0 25px rgba(0, 163, 255, 0.4); }
          50% { text-shadow: 0 0 25px rgba(0, 212, 255, 0.9), 0 0 40px rgba(0, 163, 255, 0.6); }
        }

        /* Email Link Hover */
        .email-link:hover {
          color: #00d4ff;
          transition: color 0.3s ease;
        }

        /* Footer Link Hover */
        .footer-link {
          position: relative;
          transition: all 0.3s ease;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #0066ff);
          transition: width 0.3s ease;
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .footer-link:hover {
          color: #00d4ff;
          transform: translateX(5px);
        }

        /* Social Icons Hover */
        .social-icon {
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .social-icon:hover {
          transform: translateY(-5px) scale(1.1);
        }

        .social-icon[data-color="#E4405F"]:hover {
          background: linear-gradient(135deg, #E4405F, #C13584);
          box-shadow: 0 8px 20px rgba(228, 64, 95, 0.4);
        }

        .social-icon[data-color="#FF0000"]:hover {
          background: linear-gradient(135deg, #FF0000, #CC0000);
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.4);
        }

        .social-icon[data-color="#1877F2"]:hover {
          background: linear-gradient(135deg, #1877F2, #145DBF);
          box-shadow: 0 8px 20px rgba(24, 119, 242, 0.4);
        }

        .social-icon[data-color="#25D366"]:hover {
          background: linear-gradient(135deg, #25D366, #1DA851);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
        }

        .social-icon[data-color="#0A66C2"]:hover {
          background: linear-gradient(135deg, #0A66C2, #084F91);
          box-shadow: 0 8px 20px rgba(10, 102, 194, 0.4);
        }

        .social-icon[data-color="#000000"]:hover {
          background: linear-gradient(135deg, #000000, #333333);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        /* Heart Animation */
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.2); }
          20%, 40% { transform: scale(1); }
        }

        .heart-animate:hover {
          animation: heartbeat 1s infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .bottom-bar {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#1a1a2e',
    color: '#fff',
    position: 'relative',
    marginTop: '0',
  },
  waveSeparator: {
    position: 'relative',
    top: 0,
    left: 0,
    width: '100%',
    overflow: 'hidden',
    lineHeight: 0,
    transform: 'translateY(1px)',
  },
  waveSvg: {
    display: 'block',
    width: 'calc(100% + 1.3px)',
    height: '80px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px 30px',
  },
  footerContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '50px',
    marginBottom: '50px',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: {
    marginBottom: '15px',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00d4ff 0%, #00a3ff 50%, #0066ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '5px',
  },
  tagline: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    fontStyle: 'italic',
  },
  description: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#c0c0c0',
    marginBottom: '20px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#d0d0d0',
  },
  contactIcon: {
    color: '#00d4ff',
  },
  emailLink: {
    color: '#d0d0d0',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#fff',
    position: 'relative',
    paddingBottom: '10px',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  linkItem: {
    margin: 0,
  },
  link: {
    color: '#c0c0c0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  linkIcon: {
    opacity: 0.6,
  },
  socialText: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  socialLink: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },
  socialIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    margin: '40px 0',
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  copyright: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    margin: 0,
  },
  brandName: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  madeWith: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    margin: 0,
  },
  heart: {
    color: '#ff4757',
    display: 'inline-block',
    animation: 'heartbeat 1.5s ease-in-out infinite',
    cursor: 'pointer',
  },
};