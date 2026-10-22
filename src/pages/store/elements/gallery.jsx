import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuImage } from 'react-icons/lu';
import { GalleryShell } from './index.style';

// A product's images: one large, the rest as buttons that swap it in.
function Gallery({ images = [], alt = '' }) {
	const [index, setIndex] = useState(0);
	const current = images[Math.min(index, images.length - 1)];

	return (
		<GalleryShell>
			<div className="sc_main">
				{current ? (
					<img src={current.url} alt={alt} />
				) : (
					<LuImage aria-hidden="true" />
				)}
			</div>
			{images.length > 1 && (
				<div className="sc_thumbs">
					{images.map((image, i) => (
						<button
							key={image.fileName || image.url}
							type="button"
							className="sc_thumb"
							aria-pressed={i === index}
							aria-label={`Image ${i + 1} of ${images.length}`}
							onClick={() => setIndex(i)}
						>
							<img src={image.url} alt="" loading="lazy" />
						</button>
					))}
				</div>
			)}
		</GalleryShell>
	);
}

Gallery.propTypes = {
	images: PropTypes.array,
	alt: PropTypes.string,
};

export default Gallery;
