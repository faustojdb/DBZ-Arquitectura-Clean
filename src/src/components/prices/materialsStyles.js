// Estilos compartidos para el módulo de materiales
export const styles = {
  colors: {
    primary: '#F3B340',
    secondary: '#E66A2C',
    accent: '#F094A7',
    text: '#364C63',
    background: '#F4F3EF',
    headerBg: '#1e3a5f'
  },
  container: {
    width: '100%',
    maxWidth: '6xl',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#F4F3EF',
    color: '#364C63',
  },
  header: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    fontFamily: 'Kanit, sans-serif',
    color: '#364C63',
  },
  input: {
    height: '3rem',
    fontSize: '1.125rem',
    padding: '0 1rem',
    borderRadius: '0.25rem',
    border: '1px solid',
    borderColor: '#F3B340',
    backgroundColor: 'white',
    width: '100%',
    fontFamily: 'Josefin Sans, sans-serif',
  },
  select: {
    height: '3rem',
    fontSize: '1.125rem',
    padding: '0 1rem',
    borderRadius: '0.25rem',
    border: '1px solid',
    borderColor: '#F3B340',
    backgroundColor: 'white',
    width: '100%',
    fontFamily: 'Josefin Sans, sans-serif',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#1e3a5f',
    color: 'white',
    textAlign: 'left',
  },
  tableHeaderCell: {
    padding: '0.75rem 1rem',
    fontWeight: 'bold',
    fontFamily: 'Kanit, sans-serif',
  },
  tableCell: {
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  primaryButton: {
    backgroundColor: '#F3B340',
    color: 'white',
  },
  actionButton: {
    padding: '0.25rem',
    borderRadius: '0.25rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  editButton: {
    color: '#3B82F6',
  },
  deleteButton: {
    color: '#EF4444',
  },
  saveButton: {
    color: '#10B981',
  },
  cancelButton: {
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#B91C1C',
    padding: '1rem',
    borderRadius: '0.25rem',
    marginBottom: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 0',
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '0.25rem solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#F3B340',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7280',
  },
  progressBar: {
    width: '100%',
    height: '0.625rem',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '9999px',
  }
};

export default styles;