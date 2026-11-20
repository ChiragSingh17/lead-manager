const dateFormatter = new Intl.DateTimeFormat('en', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function avatarTone(name = '') {
  const tones = ['ocean', 'violet', 'amber', 'emerald', 'rose', 'slate'];
  const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return tones[total % tones.length];
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
