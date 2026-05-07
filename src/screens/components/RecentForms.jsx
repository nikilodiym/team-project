import "./RecentForms.css";
import { LayoutGrid, ArrowUpDown, Folder } from "lucide-react";

function RecentForms() {
  return (
    <section className="recent-forms">
      <div className="recent-top">
        <h2>Останні форми</h2>

        <div className="recent-actions">
          <p>Належать будь-кому ▼</p>

          <LayoutGrid className="recent-icon" />
          <ArrowUpDown className="recent-icon" />
          <Folder className="recent-icon" />
        </div>
      </div>

      <div className="empty-block">
        <h3>Форм ще немає</h3>

        <p>Щоб почати, виберіть пусту форму або інший шаблон вище</p>
      </div>
    </section>
  );
}

export default RecentForms;
