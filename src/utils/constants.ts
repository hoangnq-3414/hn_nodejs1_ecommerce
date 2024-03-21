export const PAGE_SIZE = 2;

export const DEFAULT_PAGE = 1;

export const ROLEADMIN = 2;

export const checkAdmin = async (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== ROLEADMIN) {
    res.redirect('/');
    return; 
  }
  return user; 
}

export const calculateOffset = (page: number): number => {
  return (page - 1) * PAGE_SIZE;
};

export function formatDate(date) {
  const formattedDate = new Date(date).toLocaleString();
  return formattedDate;
}

enum OrderStatus {
  Pending = 1,
  Successful = 2,
  Rejected = 3,
  Cancel = 4,
  Unknown = 5,
}

export function getStatusText(statusNumber: number): string {
  switch (statusNumber) {
    case OrderStatus.Pending:
      return 'Pending';
    case OrderStatus.Successful:
      return 'Successful';
    case OrderStatus.Rejected:
      return 'Rejected';
    case OrderStatus.Cancel:
      return 'Cancel';
    default:
      return 'Unknown';
  }
}
