import React from "react";

class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, { hasError: boolean; error: any; }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary จับ error ได้", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 24, fontSize: 18 }}>
          <b>เกิดข้อผิดพลาดในระบบ</b>
          <div style={{ marginTop: 12 }}>
            {String(this.state.error)}
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: '#555' }}>
            กรุณารีเฟรชหน้าเว็บ หรือแจ้งผู้ดูแลระบบ
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 