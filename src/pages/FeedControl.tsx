import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { BsPlus, BsTrash } from 'react-icons/bs';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@heroui/table';
import { DateRangePicker } from '@heroui/date-picker';
import { CalendarDate } from '@internationalized/date';

// Helper function to convert CalendarDate to JavaScript Date
const toJSDate = (calendarDate: CalendarDate): Date => {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};

// Helper function to format dates
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
};

const FeedControl = () => {
  const [automaticFeeding, setAutomaticFeeding] = useState(false);
  const [foodAmount, setFoodAmount] = useState('100');
  const [schedules, setSchedules] = useState<Array<{ time: string; amount: string }>>([]);
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newScheduleAmount, setNewScheduleAmount] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({
    start: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 7),
    end: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
  });

  // Mock feed log data with actual Date objects
  const allFeedLogs = [
    { id: 1, time: '12 MAY 2025 - 17:41:30', amount: 50, duration: 15, date: new Date(2025, 4, 12, 17, 41, 30) },
    { id: 2, time: '12 MAY 2025 - 15:46:30', amount: 100, duration: 25, date: new Date(2025, 4, 12, 15, 46, 30) },
    { id: 3, time: '12 MAY 2025 - 12:46:30', amount: 75, duration: 20, date: new Date(2025, 4, 12, 12, 46, 30) },
    { id: 4, time: '12 MAY 2025 - 05:46:30', amount: 150, duration: 35, date: new Date(2025, 4, 12, 5, 46, 30) },
    { id: 5, time: '11 MAY 2025 - 17:46:30', amount: 200, duration: 45, date: new Date(2025, 4, 11, 17, 46, 30) },
  ];

  const [filteredFeedLogs, setFilteredFeedLogs] = useState(allFeedLogs);

  // Table columns
  const columns = [
    { key: "time", label: "Time" },
    { key: "amount", label: "Amount (g)" },
    { key: "duration", label: "Duration (s)" }
  ];

  // Filter feed logs when date range changes
  useEffect(() => {
    if (!filterDateRange.start && !filterDateRange.end) {
      setFilteredFeedLogs(allFeedLogs);
      return;
    }

    const filtered = allFeedLogs.filter(log => {
      const logDate = new Date(log.date.getFullYear(), log.date.getMonth(), log.date.getDate());

      if (filterDateRange.start && filterDateRange.end) {
        const start = toJSDate(filterDateRange.start);
        const end = toJSDate(filterDateRange.end);
        return logDate >= start && logDate <= end;
      } else if (filterDateRange.start) {
        const start = toJSDate(filterDateRange.start);
        return logDate >= start;
      } else if (filterDateRange.end) {
        const end = toJSDate(filterDateRange.end);
        return logDate <= end;
      }
      return true;
    });

    setFilteredFeedLogs(filtered);
  }, [filterDateRange]);

  const handleFeedNow = () => {
    console.log(`Feeding now: ${foodAmount}g`);
    // Here would be the API call to trigger feeding
  };

  const handleAddSchedule = () => {
    if (newScheduleTime && newScheduleAmount) {
      setSchedules([...schedules, { time: newScheduleTime, amount: newScheduleAmount }]);
      setNewScheduleTime('');
      setNewScheduleAmount('');
    }
  };

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedules = [...schedules];
    updatedSchedules.splice(index, 1);
    setSchedules(updatedSchedules);
  };

  const handleDateRangeReset = () => {
    setFilterDateRange({
      start: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 7),
      end: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    });
  };

  // Render cell content, handling date objects
  const renderCellContent = (item: any, columnKey: React.Key) => {
    if (columnKey === 'date') {
      return formatDate(item.date);
    }
    return item[columnKey as keyof typeof item];
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Feed Control</h1>

      <div className="bg-content1 rounded-lg shadow-sm p-5">
        <div className="space-y-4">
          {/* Feed Control Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-60">
                <Input
                  type="number"
                  value={foodAmount}
                  onChange={(e) => setFoodAmount(e.target.value)}
                  label="Food Amount (g)"
                  labelPlacement="inside"
                  min="100"
                  className="w-full"
                />
              </div>
              <Button
                color="primary"
                onClick={handleFeedNow}
                className="px-6"
              >
                FEED NOW
              </Button>
            </div>
          </div>

          {/* Feed Schedule Section */}
          <div className="flex items-center gap-2">
            <Switch
              checked={automaticFeeding}
              onChange={() => setAutomaticFeeding(!automaticFeeding)}
              color="primary"
            />
            <span>Automatic Feeding Schedule</span>
          </div>
          {automaticFeeding && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Feed Schedule</h2>

              {schedules.map((schedule, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-60">
                    <label className="block text-sm text-gray-600 mb-1">Time</label>
                    <Input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => {
                        const updatedSchedules = [...schedules];
                        updatedSchedules[index].time = e.target.value;
                        setSchedules(updatedSchedules);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="w-60">
                    <label className="block text-sm text-gray-600 mb-1">Amount (g)</label>
                    <Input
                      type="number"
                      value={schedule.amount}
                      onChange={(e) => {
                        const updatedSchedules = [...schedules];
                        updatedSchedules[index].amount = e.target.value;
                        setSchedules(updatedSchedules);
                      }}
                      min="0"
                      className="w-full"
                    />
                  </div>
                  <Button
                    color="danger"
                    variant="ghost"
                    className="mt-6"
                    onClick={() => handleRemoveSchedule(index)}
                  >
                    <BsTrash />
                  </Button>
                </div>
              ))}

              <div className="flex items-end gap-4">
                <div className="w-60">
                  <label className="block text-sm text-gray-600 mb-1">Time</label>
                  <Input
                    type="time"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-60">
                  <label className="block text-sm text-gray-600 mb-1">Amount (g)</label>
                  <Input
                    type="number"
                    value={newScheduleAmount}
                    onChange={(e) => setNewScheduleAmount(e.target.value)}
                    min="0"
                    className="w-full"
                  />
                </div>
                <Button
                  color="primary"
                  variant="bordered"
                  onClick={handleAddSchedule}
                  className="flex items-center gap-1"
                >
                  <BsPlus className="text-lg" />
                  ADD SCHEDULE
                </Button>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6"></div>
            </div>
          )}
        </div>
      </div>

      {/* Feed Log Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Feed Log</h2>

          {/* Date Range Filter */}
          <div className="flex items-center gap-3">
            <DateRangePicker
              className="max-w-xs"
              label="Filter by date range"
              value={filterDateRange}
              onChange={(value) => {
                if (value) {
                  setFilterDateRange({ start: value.start, end: value.end });
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDateRangeReset}
              className="mb-0.5"
            >
              Reset
            </Button>
          </div>
        </div>

        <Table aria-label="Feed log table">
          <TableHeader columns={columns}>
            {(column: { key: string; label: string }) => (
              <TableColumn
                key={column.key}
                align={column.key !== "time" ? "end" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={filteredFeedLogs} emptyContent="No feed logs found for the selected date range">
            {(item: { id: number; time: string; amount: number; duration: number; date: Date }) => (
              <TableRow key={item.id}>
                {(columnKey: React.Key) => (
                  <TableCell>
                    {renderCellContent(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FeedControl; 