import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const needNoteRoles = [
  "iqama",
  "istikhbarat_defense",
  "mokhabarat",
  "amn_watani",
];

export default function ActionWithNote({
  userRole,
  onApprove,
  onReject,
  loading,
}) {
  // 🔹 للموافقة مع ملاحظة
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [note, setNote] = useState("");

  // 🔹 منطق الرفض القديم (نفسه 100%)
  const [confirmAction, setConfirmAction] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const needNote = needNoteRoles.includes(userRole);

  // ✅ نفس الدالة القديمة حرفيًا
  const handleOpenConfirmDialog = (actionType) => {
    setConfirmAction(actionType);
    setOpenConfirmDialog(true);
  };

  const handleApproveClick = () => {
    if (needNote) {
      setOpenNoteModal(true);
    } else {
      onApprove();
    }
  };

  const handleConfirmApprove = () => {
    setOpenNoteModal(false);
    onApprove(note);
    setNote("");
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    setOpenConfirmDialog(false);
    onReject(rejectReason);
    setRejectReason("");
  };

  return (
    <>
      {/* ✅ Buttons */}
      <Button
        variant="contained"
        onClick={handleApproveClick}
        disabled={loading}
      >
        موافقة
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => handleOpenConfirmDialog("reject")}
      >
        رفض الطلب
      </Button>

      {/* 🟢 Modal الملاحظة (للموافقة فقط) */}
      <Dialog open={openNoteModal} onClose={() => setOpenNoteModal(false)}>
        <DialogTitle>ملاحظة الموافقة</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="اكتب الملاحظة"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteModal(false)}>إلغاء</Button>
          <Button
            variant="contained"
            disabled={!note.trim()}
            onClick={handleConfirmApprove}
          >
            تأكيد
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔴 Dialog الرفض (نفس المنطق القديم) */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        dir="rtl"
      >
        <DialogTitle>تأكيد رفض الطلب</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="سبب الرفض"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={handleConfirmReject}
          >
            تأكيد الرفض
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
