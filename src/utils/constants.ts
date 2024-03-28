export const PAGE_SIZE = 2;

export const DEFAULT_PAGE = 1;

export const ROLEADMIN = 2;

export const DISABLE = 0;

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

export enum OrderStatus {
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

// ham lay ngay trong thang
export function getDaysInMonth(date: Date): string[] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = [];
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(
      `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
    );
  }
  return daysArray;
}
