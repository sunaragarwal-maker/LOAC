// Shows the nearest upcoming festival in the announcement bar, so the
// message stays relevant year-round instead of needing manual swaps.
(function () {
  var ORDER_BUFFER_DAYS = 12; // matches stated 3-5 day production + 5-7 day delivery
  var WINDOW_DAYS = 21; // how many days before a festival the banner starts showing

  var FESTIVALS = [
    { key: 'raksha-bandhan-2026', date: '2026-08-28', emoji: '🎀', label: 'Raksha Bandhan' },
    { key: 'ganesh-chaturthi-2026', date: '2026-09-14', emoji: '🐘', label: 'Ganesh Chaturthi' },
    { key: 'dussehra-2026', date: '2026-10-20', emoji: '🏹', label: 'Dussehra' },
    { key: 'diwali-2026', date: '2026-11-08', emoji: '🪔', label: 'Diwali' },
    { key: 'bhai-dooj-2026', date: '2026-11-11', emoji: '👫', label: 'Bhai Dooj' },
    { key: 'christmas-2026', date: '2026-12-25', emoji: '🎄', label: 'Christmas' },
    { key: 'new-year-2027', date: '2027-01-01', emoji: '🎉', label: 'New Year' },
    { key: 'holi-2027', date: '2027-03-22', emoji: '🎨', label: 'Holi' }
  ];

  function formatDate(d) {
    return d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' });
  }

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var active = null;
  for (var i = 0; i < FESTIVALS.length; i++) {
    var f = FESTIVALS[i];
    var festivalDate = new Date(f.date + 'T00:00:00');
    var windowStart = addDays(festivalDate, -WINDOW_DAYS);
    if (today >= windowStart && today <= festivalDate) {
      active = f;
      break;
    }
  }

  if (!active) return;

  var dismissKey = 'festival-dismissed-' + active.key;
  var dismissed;
  try { dismissed = localStorage.getItem(dismissKey); } catch (e) { dismissed = null; }
  if (dismissed) return;

  var banner = document.getElementById('festival-banner');
  var text = document.getElementById('festival-banner-text');
  var closeBtn = document.getElementById('festival-banner-close');
  if (!banner || !text || !closeBtn) return;

  var festivalDate = new Date(active.date + 'T00:00:00');
  var orderBy = addDays(festivalDate, -ORDER_BUFFER_DAYS);

  text.innerHTML = active.emoji + ' ' + active.label + ' is <strong>' + formatDate(festivalDate) +
    '</strong> — order by ' + formatDate(orderBy) + ' for guaranteed delivery!';
  banner.style.display = '';

  closeBtn.addEventListener('click', function () {
    banner.style.display = 'none';
    try { localStorage.setItem(dismissKey, '1'); } catch (e) {}
  });
})();
