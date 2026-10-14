import styled from 'styled-components';

export const LayoutWrapper = styled.div`
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: ${({ theme }) => theme.surface.background};
`;
