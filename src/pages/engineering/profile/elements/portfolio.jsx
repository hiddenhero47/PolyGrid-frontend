import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuImage, LuFileText } from 'react-icons/lu';
import Modal from '../../../../components/modal/index_modal';
import { Chip } from '../../../home/elements/index.style';
import { PortfolioTile } from './index.style';

const isImage = (media) => media?.mime?.startsWith('image/');

const monthYear = (value) =>
	value
		? new Date(value).toLocaleDateString('en-GB', {
				month: 'short',
				year: 'numeric',
			})
		: null;

const dateRange = (item) => {
	const start = monthYear(item.startedAt);
	const end = monthYear(item.completedAt);
	if (start && end) return `${start} – ${end}`;
	if (start) return `${start} – ongoing`;
	return end;
};

// Portfolio grid (title / description / tags / media per item —
// frontend-plan §A.6). A tile opens the full item in a modal.
function Portfolio({ items = [] }) {
	const modalRef = useRef(null);
	const [active, setActive] = useState(null);

	const open = (item) => {
		setActive(item);
		modalRef.current.open();
	};

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2">
				{items.map((item) => {
					const cover = item.media?.find(isImage);
					return (
						<PortfolioTile
							key={item._id}
							type="button"
							onClick={() => open(item)}
						>
							<span className="sc_media" aria-hidden="true">
								{cover ? (
									<img src={cover.url} alt="" loading="lazy" />
								) : (
									<LuImage />
								)}
							</span>
							<span className="sc_body">
								<span className="sc_title">{item.title}</span>
								{dateRange(item) && (
									<span className="sc_dates">{dateRange(item)}</span>
								)}
							</span>
						</PortfolioTile>
					);
				})}
			</div>

			<Modal.Center
				refName={modalRef}
				width="760px"
				queryWidth="100%"
				onClose={() => setActive(null)}
			>
				{active && (
					<Modal.Card
						eyebrow={dateRange(active) || 'Portfolio'}
						title={active.title}
					>
						<div className="flex flex-col gap-5">
							{active.description && (
								<p className="text-[15px] leading-relaxed whitespace-pre-line text-(--pg-text-secondary)">
									{active.description}
								</p>
							)}
							{active.tags?.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{active.tags.map((tag) => (
										<Chip key={tag}>{tag}</Chip>
									))}
								</div>
							)}
							{active.media?.length > 0 && (
								<div className="grid gap-3 sm:grid-cols-2">
									{active.media.map((media) =>
										isImage(media) ? (
											<a
												key={media.fileName}
												href={media.url}
												target="_blank"
												rel="noopener noreferrer"
												className="block overflow-hidden rounded-xl"
											>
												<img
													src={media.url}
													alt=""
													loading="lazy"
													className="h-full w-full object-cover"
												/>
											</a>
										) : (
											<a
												key={media.fileName}
												href={media.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-3 rounded-xl border border-(--pg-card-border) p-4 text-(--pg-text-link) hover:underline"
											>
												<LuFileText className="text-xl" aria-hidden="true" />
												{media.fileName}
											</a>
										)
									)}
								</div>
							)}
						</div>
					</Modal.Card>
				)}
			</Modal.Center>
		</>
	);
}

Portfolio.propTypes = {
	items: PropTypes.array,
};

export default Portfolio;
